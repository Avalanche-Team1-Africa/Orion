import { Errors, MyError } from "@/constants/errors";
import axios from "axios";
import "../../../envConfig";

export async function getAccessToken(): Promise<string> {
    try {
        const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: {
                Authorization: `Basic ${process.env.AUTHORIZATION}`,

            }
        });

        if (response.status === 200) {
            return response.data['access_token'] ?? "";
        } else {
            throw new MyError(Errors.NOT_GET_SAFARICOM_TOKEN);
        }
    } catch(err) {
        console.log("Could not get access token from safaricom", err);
        throw new MyError(Errors.NOT_GET_SAFARICOM_TOKEN);
    }
}