import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { action, doctor_id } = await req.json();

    if (action === "compute_analytics") {
      return await computeAnalytics(supabase, doctor_id);
    } else if (action === "generate_recommendations") {
      return await generateRecommendations(supabase, doctor_id);
    } else if (action === "get_insights") {
      return await getInsights(supabase, doctor_id);
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function computeAnalytics(supabase: any, doctorId?: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const periodStart = thirtyDaysAgo.toISOString().split("T")[0];
  const periodEnd = new Date().toISOString().split("T")[0];

  // Get doctors to compute for
  let doctorIds: string[] = [];
  if (doctorId) {
    doctorIds = [doctorId];
  } else {
    const { data: doctors } = await supabase
      .from("doctors")
      .select("id")
      .eq("status", "active");
    doctorIds = (doctors || []).map((d: any) => d.id);
  }

  const results = [];

  for (const dId of doctorIds) {
    // Fetch appointments for this doctor in the period
    const { data: appointments } = await supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, duration")
      .eq("doctor_id", dId)
      .gte("appointment_date", periodStart)
      .lte("appointment_date", periodEnd)
      .is("deleted_at", null);

    const appts = appointments || [];
    const total = appts.length;
    const completed = appts.filter((a: any) => a.status === "completed").length;
    const cancelled = appts.filter((a: any) => a.status === "cancelled").length;
    const noShow = appts.filter((a: any) => a.status === "no_show").length;
    const noShowRate = total > 0 ? (noShow / total) * 100 : 0;

    // Count unique days with appointments
    const uniqueDays = new Set(appts.map((a: any) => a.appointment_date)).size;
    const avgDaily = uniqueDays > 0 ? total / uniqueDays : 0;

    // Peak hour
    const hourCounts: Record<number, number> = {};
    appts.forEach((a: any) => {
      const hour = parseInt(a.appointment_time?.split(":")[0] || "0");
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    // Busiest day of week
    const dayCounts: Record<number, number> = {};
    appts.forEach((a: any) => {
      const date = new Date(a.appointment_date);
      const day = date.getUTCDay();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const busiestDay = Object.entries(dayCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    // Utilization rate - compare with available slots
    const { data: schedules } = await supabase
      .from("staff_schedules")
      .select("*")
      .eq("staff_id", dId)
      .eq("staff_type", "doctor")
      .eq("is_available", true);

    let totalAvailableSlots = 0;
    (schedules || []).forEach((s: any) => {
      const startMins =
        parseInt(s.start_time.split(":")[0]) * 60 +
        parseInt(s.start_time.split(":")[1]);
      const endMins =
        parseInt(s.end_time.split(":")[0]) * 60 +
        parseInt(s.end_time.split(":")[1]);
      const duration = s.slot_duration || 30;
      const slotsPerDay = Math.floor((endMins - startMins) / duration);
      // Multiply by number of weeks in period (approx 4)
      totalAvailableSlots += slotsPerDay * 4;
    });

    // Also try with user_id mapping
    if (totalAvailableSlots === 0) {
      const { data: doctor } = await supabase
        .from("doctors")
        .select("user_id")
        .eq("id", dId)
        .maybeSingle();
      if (doctor?.user_id) {
        const { data: userSchedules } = await supabase
          .from("staff_schedules")
          .select("*")
          .eq("staff_id", doctor.user_id)
          .eq("staff_type", "doctor")
          .eq("is_available", true);
        (userSchedules || []).forEach((s: any) => {
          const startMins =
            parseInt(s.start_time.split(":")[0]) * 60 +
            parseInt(s.start_time.split(":")[1]);
          const endMins =
            parseInt(s.end_time.split(":")[0]) * 60 +
            parseInt(s.end_time.split(":")[1]);
          const duration = s.slot_duration || 30;
          const slotsPerDay = Math.floor((endMins - startMins) / duration);
          totalAvailableSlots += slotsPerDay * 4;
        });
      }
    }

    const utilizationRate =
      totalAvailableSlots > 0 ? (total / totalAvailableSlots) * 100 : 0;

    // Upsert analytics
    const { error } = await supabase.from("scheduling_analytics").upsert(
      {
        doctor_id: dId,
        period_start: periodStart,
        period_end: periodEnd,
        total_appointments: total,
        completed_appointments: completed,
        cancelled_appointments: cancelled,
        no_show_appointments: noShow,
        no_show_rate: Math.round(noShowRate * 100) / 100,
        avg_daily_appointments: Math.round(avgDaily * 100) / 100,
        peak_hour: peakHour ? parseInt(peakHour) : null,
        busiest_day: busiestDay ? parseInt(busiestDay) : null,
        utilization_rate: Math.round(utilizationRate * 100) / 100,
        computed_at: new Date().toISOString(),
      },
      { onConflict: "doctor_id,period_start,period_end" }
    );

    results.push({ doctor_id: dId, total, noShowRate, utilizationRate, error });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function generateRecommendations(supabase: any, doctorId?: string) {
  // Build filter
  let query = supabase.from("scheduling_analytics").select("*");
  if (doctorId) query = query.eq("doctor_id", doctorId);

  const { data: analytics } = await query;
  if (!analytics || analytics.length === 0) {
    return new Response(
      JSON.stringify({ success: true, recommendations: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const recommendations: any[] = [];

  for (const a of analytics) {
    // Clear old recommendations for this doctor
    await supabase
      .from("scheduling_recommendations")
      .delete()
      .eq("doctor_id", a.doctor_id)
      .eq("is_dismissed", false);

    // High no-show rate
    if (a.no_show_rate > 15) {
      recommendations.push({
        doctor_id: a.doctor_id,
        recommendation_type: "no_show_risk",
        title: "High No-Show Rate Detected",
        description: `No-show rate is ${a.no_show_rate}%. Consider sending appointment reminders 24h before, or strategic overbooking by 1-2 slots during peak hours.`,
        priority: a.no_show_rate > 25 ? "high" : "medium",
        metadata: { no_show_rate: a.no_show_rate, threshold: 15 },
      });
    }

    // Low utilization
    if (a.utilization_rate < 50 && a.utilization_rate > 0) {
      recommendations.push({
        doctor_id: a.doctor_id,
        recommendation_type: "workload_balance",
        title: "Low Schedule Utilization",
        description: `Only ${a.utilization_rate}% of available slots are being used. Consider reducing available hours or redistributing patients from overloaded doctors.`,
        priority: a.utilization_rate < 30 ? "high" : "medium",
        metadata: { utilization_rate: a.utilization_rate },
      });
    }

    // High utilization - risk of burnout
    if (a.utilization_rate > 90) {
      recommendations.push({
        doctor_id: a.doctor_id,
        recommendation_type: "workload_balance",
        title: "Schedule Near Capacity",
        description: `Utilization is at ${a.utilization_rate}%. Consider adding more time slots, extending hours, or distributing patients to other doctors to prevent burnout.`,
        priority: "high",
        metadata: { utilization_rate: a.utilization_rate },
      });
    }

    // Peak hour optimization
    if (a.peak_hour !== null && a.avg_daily_appointments > 5) {
      recommendations.push({
        doctor_id: a.doctor_id,
        recommendation_type: "peak_optimization",
        title: "Peak Hour Concentration",
        description: `Most appointments cluster around ${a.peak_hour}:00. Consider spreading appointments more evenly to reduce patient wait times.`,
        priority: "low",
        metadata: {
          peak_hour: a.peak_hour,
          avg_daily: a.avg_daily_appointments,
        },
      });
    }

    // Overbooking suggestion for high no-show
    if (a.no_show_rate > 20 && a.utilization_rate < 85) {
      const suggestedOverbook = Math.ceil(a.no_show_rate / 10);
      recommendations.push({
        doctor_id: a.doctor_id,
        recommendation_type: "overbooking",
        title: "Strategic Overbooking Suggested",
        description: `Based on ${a.no_show_rate}% no-show rate, consider overbooking ${suggestedOverbook} extra slot(s) per day to maximize utilization without excessive wait times.`,
        priority: "medium",
        metadata: {
          suggested_overbook: suggestedOverbook,
          no_show_rate: a.no_show_rate,
        },
      });
    }
  }

  // Insert recommendations
  if (recommendations.length > 0) {
    await supabase.from("scheduling_recommendations").insert(recommendations);
  }

  return new Response(
    JSON.stringify({ success: true, count: recommendations.length }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getInsights(supabase: any, doctorId?: string) {
  // Get overall stats from appointments
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const periodStart = thirtyDaysAgo.toISOString().split("T")[0];

  const { data: appointments } = await supabase
    .from("appointments")
    .select("doctor_id, appointment_date, appointment_time, status")
    .gte("appointment_date", periodStart)
    .is("deleted_at", null);

  const appts = appointments || [];

  // Hour distribution
  const hourDistribution: Record<number, number> = {};
  for (let h = 6; h <= 20; h++) hourDistribution[h] = 0;
  appts.forEach((a: any) => {
    const hour = parseInt(a.appointment_time?.split(":")[0] || "0");
    if (hourDistribution[hour] !== undefined) hourDistribution[hour]++;
  });

  // Day distribution
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayDistribution: Record<string, number> = {};
  dayNames.forEach((d) => (dayDistribution[d] = 0));
  appts.forEach((a: any) => {
    const date = new Date(a.appointment_date);
    dayDistribution[dayNames[date.getUTCDay()]]++;
  });

  // Doctor workload
  const doctorLoad: Record<string, number> = {};
  appts.forEach((a: any) => {
    doctorLoad[a.doctor_id] = (doctorLoad[a.doctor_id] || 0) + 1;
  });

  // Get doctor names
  const doctorIds = Object.keys(doctorLoad);
  const { data: doctors } = await supabase
    .from("doctors")
    .select("id, first_name, last_name")
    .in("id", doctorIds.length > 0 ? doctorIds : ["none"]);

  const doctorWorkload = Object.entries(doctorLoad)
    .map(([id, count]) => {
      const doc = (doctors || []).find((d: any) => d.id === id);
      return {
        doctor_id: id,
        name: doc
          ? `Dr. ${doc.first_name} ${doc.last_name}`
          : "Unknown",
        appointments: count,
      };
    })
    .sort((a, b) => b.appointments - a.appointments);

  // Status breakdown
  const statusBreakdown = {
    completed: appts.filter((a: any) => a.status === "completed").length,
    cancelled: appts.filter((a: any) => a.status === "cancelled").length,
    no_show: appts.filter((a: any) => a.status === "no_show").length,
    scheduled: appts.filter(
      (a: any) => a.status === "scheduled" || a.status === "confirmed"
    ).length,
  };

  return new Response(
    JSON.stringify({
      success: true,
      insights: {
        total_appointments: appts.length,
        hour_distribution: hourDistribution,
        day_distribution: dayDistribution,
        doctor_workload: doctorWorkload.slice(0, 10),
        status_breakdown: statusBreakdown,
      },
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
