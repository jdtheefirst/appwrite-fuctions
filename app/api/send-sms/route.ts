import { Client, Functions } from "appwrite";
import { NextResponse } from "next/server";

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { error: "Phone and message are required" },
        { status: 400 }
      );
    }

    const functions = new Functions(client);
    const result = await functions.createExecution(
      "send-sms",
      JSON.stringify({ phone, message }),
      false
    );

    return NextResponse.json({
      success: true,
      data: JSON.parse(result.responseBody),
    });
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    return NextResponse.json(
      { error: "Failed to send SMS", details: error.message },
      { status: 500 }
    );
  }
}
