"use server"

import { Errors, MyError } from "@/constants/errors";
import { STKPush } from "@/constants/types";
import { getAccessToken } from "./authentication";
import axios from "axios";
import "../../../envConfig";

export async function sendSTKPush(args: STKPush): Promise<string> {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const day = today.getDate();
        const minutes = today.getMinutes();
        const hours = today.getHours();
        const month = today.getMonth();
        const second = today.getSeconds();
        const timestamp = `${year}${((month + 1).toString()).padStart(2, "0")}${((day).toString()).padStart(2, "0")}${((hours).toString()).padStart(2, "0")}${((minutes).toString()).padStart(2, "0")}${((second).toString()).padStart(2, "0")}`;

        const accesToken = await getAccessToken();
        const plainPassword = `${process.env.BUSINESS_SHORT_CODE}${process.env.PASS_KEY}${timestamp}`;
        const encoded = btoa(plainPassword);

        const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
            "BusinessShortCode": process.env.BUSINESS_SHORT_CODE,
            "Password": encoded,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": args.amount,
            "PartyA": args.customer_phone_number,
            "PartyB": process.env.BUSINESS_SHORT_CODE,
            "PhoneNumber": args.customer_phone_number,
            "CallBackURL": `${process.env.URL}/api/payment`,
            "AccountReference": "Orion Stocks",
            "TransactionDesc": `Buy ${args.stock_symbol}`
        }, {
            headers: {
                Authorization: `Bearer ${accesToken}`
            }
        });

        if (response.status !== 200) {
            throw new MyError(Errors.NOT_SEND_STK_PUSH);
        } else {
            return response.data['MerchantRequestID'];
        }
    } catch (err) {
        console.log("Could not send STK Push", err);
        throw new MyError(Errors.NOT_SEND_STK_PUSH);
    }
}
