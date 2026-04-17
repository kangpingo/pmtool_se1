import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth')
  response.cookies.delete('username')
  response.cookies.delete('lang')
  response.cookies.delete('theme')
  return response
}
