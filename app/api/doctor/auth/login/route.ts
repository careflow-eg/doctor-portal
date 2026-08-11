import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Query doctor user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Invalid doctor account credentials or unauthorized role" },
        { status: 401 }
      );
    }

    const token = `doc_jwt_${user.id}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      access_token: token,
      token_type: "bearer",
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name || "Dr. CareFlow Specialist",
        role: user.role || "DOCTOR",
      },
    });
  } catch (error) {
    console.error("Doctor login API error:", error);
    return NextResponse.json(
      { error: "Internal server error during doctor authentication" },
      { status: 500 }
    );
  }
}
