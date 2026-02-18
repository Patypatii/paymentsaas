import axios from 'axios';

async function simulateCallback() {
    const url = 'http://localhost:5000/api/v1/public/callbacks/daraja';
    console.log(`🚀 Simulating Daraja callback to ${url}...`);

    const payload = {
        Body: {
            stkCallback: {
                MerchantRequestID: "12345-67890",
                CheckoutRequestID: "ws_CO_123456789",
                ResultCode: 0,
                ResultDesc: "The service request is processed successfully.",
                CallbackMetadata: {
                    Item: [
                        { Name: "Amount", Value: 2.00 },
                        { Name: "MpesaReceiptNumber", Value: "UBI7Y6W81T" },
                        { Name: "Balance", Value: 0 },
                        { Name: "TransactionDate", Value: 20260218154928 },
                        { Name: "PhoneNumber", Value: 254758841701 }
                    ]
                }
            }
        }
    };

    try {
        const response = await axios.post(url, payload);
        console.log('✅ Callback simulation response:', response.status, response.data);
    } catch (error: any) {
        console.error('❌ Callback simulation FAILED:', error.response?.data || error.message);
    }
}

simulateCallback();
