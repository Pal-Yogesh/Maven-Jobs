import prisma from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userID, code } = await request.json();
    console.log(userID, code);
    const decodeUserID = decodeURIComponent(userID);

    const user = await prisma.user.findUnique({
      where: { id: decodeUserID }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpire = new Date(user.verifyCodeExpiry!!) > new Date();

    if (isCodeValid && isCodeNotExpire) {
      const UpdateUser = await prisma.user.update({
        where: { id: decodeUserID },
        data: {
          isVerified: true
        }
      })
      return NextResponse.json({
        success: true,
        message: 'Account Verified successfully'
      }, { status: 200 })
    }
    else if (!isCodeNotExpire) {
      return NextResponse.json({
        success: false,
        message: 'Verification code has expired. Please sign up again to get a new code.'
      }, { status: 400 })
    }
    else {
      return NextResponse.json({
        success: false,
        message: 'Incorrect verification code'
      }, { status: 200 })
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error verifying user' },
      { status: 500 }
    )
  }
}