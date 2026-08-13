/**
 * Sends the signed access pass token to the participant's email.
 */
export declare function sendEmailPass(email: string, name: string, token: string): Promise<boolean>;
