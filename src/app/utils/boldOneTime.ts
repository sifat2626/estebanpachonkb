import axios from 'axios';
import config from "../../config";

const BOLD_API_KEY = config.BOLD_API_KEY;
const BOLD_API_URL = config.BOLD_API_URL;

export const BoldOneTimePayment = async (amountToBePaid:number, userId:string, paymentMethod:string) => {
    try {
        // Create payment request on Bold's API
        const response = await axios.post(
            `${BOLD_API_URL}/v1/charge`,  // Adjust this endpoint based on Bold's documentation
            {
                amount: Math.round(amountToBePaid * 100),  // Bold works in cents, like Stripe
                currency: 'usd',  // You can modify the currency as per your needs
                payment_method: paymentMethod,  // Payment method (token received from the frontend)
                metadata: {
                    userId,  // Store user ID for reference
                },
            },
            {
                headers: {
                    'Authorization': `Bearer ${BOLD_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        // The response from Bold API containing the payment result
        const paymentResult = response.data;

        return paymentResult; // Return the result to the caller (frontend)

    } catch (error:any) {
        console.error('Bold payment failed:', error.response || error);
        throw new Error('Payment failed with Bold');
    }
};
