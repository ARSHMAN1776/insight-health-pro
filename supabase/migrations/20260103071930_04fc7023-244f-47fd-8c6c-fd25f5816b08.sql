-- Create function to notify patient on claim status change
CREATE OR REPLACE FUNCTION public.notify_patient_on_claim_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    patient_user_id uuid;
    patient_name text;
    notification_title text;
    notification_message text;
    notification_priority text;
BEGIN
    -- Only trigger on status changes
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get patient's user_id and name
    SELECT user_id, first_name || ' ' || last_name
    INTO patient_user_id, patient_name
    FROM public.patients
    WHERE id = NEW.patient_id;

    -- Skip if patient has no user account
    IF patient_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Set notification content based on new status
    CASE NEW.status
        WHEN 'submitted' THEN
            notification_title := 'Insurance Claim Submitted';
            notification_message := 'Your insurance claim #' || NEW.claim_number || ' has been submitted for $' || NEW.total_amount || ' to ' || NEW.insurance_provider || '.';
            notification_priority := 'normal';
        WHEN 'under_review' THEN
            notification_title := 'Claim Under Review';
            notification_message := 'Your insurance claim #' || NEW.claim_number || ' is now under review by ' || NEW.insurance_provider || '.';
            notification_priority := 'normal';
        WHEN 'approved' THEN
            notification_title := 'Claim Approved!';
            notification_message := 'Great news! Your claim #' || NEW.claim_number || ' has been approved for $' || COALESCE(NEW.approved_amount, NEW.total_amount) || '.';
            notification_priority := 'high';
        WHEN 'denied' THEN
            notification_title := 'Claim Denied - Action Required';
            notification_message := 'Your insurance claim #' || NEW.claim_number || ' has been denied. Reason: ' || COALESCE(NEW.denial_reason, 'Not specified') || '. You may be eligible to file an appeal.';
            notification_priority := 'high';
        WHEN 'appealed' THEN
            notification_title := 'Claim Appeal Submitted';
            notification_message := 'Your appeal for claim #' || NEW.claim_number || ' has been submitted and is pending review.';
            notification_priority := 'normal';
        WHEN 'paid' THEN
            notification_title := 'Claim Payment Processed';
            notification_message := 'Payment for your claim #' || NEW.claim_number || ' has been processed. Amount: $' || COALESCE(NEW.approved_amount, NEW.total_amount) || '.';
            notification_priority := 'high';
        ELSE
            -- Don't notify for other statuses like 'draft'
            RETURN NEW;
    END CASE;

    -- Insert notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        priority,
        action_url,
        metadata
    ) VALUES (
        patient_user_id,
        notification_title,
        notification_message,
        'insurance_claim',
        notification_priority,
        '/insurance-claims',
        jsonb_build_object(
            'claim_id', NEW.id,
            'claim_number', NEW.claim_number,
            'old_status', OLD.status,
            'new_status', NEW.status,
            'amount', NEW.total_amount,
            'approved_amount', NEW.approved_amount,
            'insurance_provider', NEW.insurance_provider
        )
    );

    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER notify_patient_claim_status
    AFTER UPDATE ON public.insurance_claims
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_patient_on_claim_status_change();