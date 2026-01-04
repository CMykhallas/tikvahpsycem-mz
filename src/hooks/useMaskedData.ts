import { useMemo } from 'react';
import { useAuth } from './useAuth';
import {
  maskEmail,
  maskPhone,
  maskName,
  maskPaymentReference,
  maskAccessToken,
  maskIpAddress,
  maskMetadata,
  getMaskingConfig,
  type MaskingLevel
} from '@/utils/dataMasking';

/**
 * Hook for applying data masking based on user role
 */
export const useMaskedData = () => {
  const { isAdmin, user } = useAuth();
  
  // Determine masking level based on role
  // For now, we assume non-admins get partial masking
  // Admins still get partial masking for extra security
  const maskingLevel: MaskingLevel = useMemo(() => {
    if (isAdmin) return 'partial';
    if (user) return 'partial'; // Staff would be here
    return 'full';
  }, [isAdmin, user]);
  
  const config = useMemo(() => getMaskingConfig(
    isAdmin ? 'admin' : user ? 'staff' : null
  ), [isAdmin, user]);
  
  /**
   * Mask an email address
   */
  const maskedEmail = (email: string | null | undefined): string => {
    if (maskingLevel === 'none') return email || '';
    return maskEmail(email);
  };
  
  /**
   * Mask a phone number
   */
  const maskedPhone = (phone: string | null | undefined): string => {
    if (maskingLevel === 'none') return phone || '';
    return maskPhone(phone);
  };
  
  /**
   * Mask a name
   */
  const maskedName = (name: string | null | undefined): string => {
    // Names are only masked for non-authenticated users
    if (maskingLevel === 'none' || maskingLevel === 'partial') return name || '';
    return maskName(name);
  };
  
  /**
   * Mask a payment reference
   */
  const maskedPaymentRef = (ref: string | null | undefined): string => {
    if (maskingLevel === 'none') return ref || '';
    return maskPaymentReference(ref);
  };
  
  /**
   * Mask an access token
   */
  const maskedToken = (token: string | null | undefined): string => {
    // Tokens are always masked
    return maskAccessToken(token);
  };
  
  /**
   * Mask an IP address
   */
  const maskedIp = (ip: string | null | undefined): string => {
    // IPs are only fully visible to admins
    if (isAdmin && maskingLevel === 'none') return ip || '';
    return maskIpAddress(ip);
  };
  
  /**
   * Mask metadata object
   */
  const maskedMeta = (metadata: Record<string, any> | null | undefined) => {
    if (maskingLevel === 'none') return metadata;
    return maskMetadata(metadata);
  };
  
  /**
   * Format order data with masked fields
   */
  const maskOrderData = (order: {
    id: string;
    phone_number?: string | null;
    mpesa_reference?: string | null;
    bank_transfer_reference?: string | null;
    order_access_token?: string | null;
    metadata?: Record<string, any> | null;
    [key: string]: any;
  }) => {
    return {
      ...order,
      phone_number: maskedPhone(order.phone_number),
      mpesa_reference: maskedPaymentRef(order.mpesa_reference),
      bank_transfer_reference: maskedPaymentRef(order.bank_transfer_reference),
      order_access_token: maskedToken(order.order_access_token),
      metadata: maskedMeta(order.metadata)
    };
  };
  
  /**
   * Format contact data with masked fields
   */
  const maskContactData = (contact: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    [key: string]: any;
  }) => {
    return {
      ...contact,
      email: maskedEmail(contact.email),
      phone: maskedPhone(contact.phone)
    };
  };
  
  /**
   * Format appointment data with masked fields
   */
  const maskAppointmentData = (appointment: {
    id: string;
    client_name: string;
    email: string;
    phone: string;
    [key: string]: any;
  }) => {
    return {
      ...appointment,
      email: maskedEmail(appointment.email),
      phone: maskedPhone(appointment.phone)
    };
  };
  
  /**
   * Format lead data with masked fields
   */
  const maskLeadData = (lead: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    [key: string]: any;
  }) => {
    return {
      ...lead,
      email: maskedEmail(lead.email),
      phone: maskedPhone(lead.phone)
    };
  };
  
  /**
   * Format profile data with masked fields
   */
  const maskProfileData = (profile: {
    id: string;
    email: string;
    full_name?: string | null;
    [key: string]: any;
  }) => {
    return {
      ...profile,
      email: maskedEmail(profile.email)
    };
  };
  
  /**
   * Format security incident data with masked fields
   */
  const maskSecurityIncidentData = (incident: {
    id: string;
    ip_address: string;
    user_agent?: string | null;
    details?: Record<string, any> | null;
    [key: string]: any;
  }) => {
    return {
      ...incident,
      ip_address: maskedIp(incident.ip_address),
      details: maskedMeta(incident.details)
    };
  };
  
  return {
    maskingLevel,
    config,
    maskedEmail,
    maskedPhone,
    maskedName,
    maskedPaymentRef,
    maskedToken,
    maskedIp,
    maskedMeta,
    maskOrderData,
    maskContactData,
    maskAppointmentData,
    maskLeadData,
    maskProfileData,
    maskSecurityIncidentData
  };
};

export default useMaskedData;
