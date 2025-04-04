import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: 全カテゴリーを取得
export async function GET() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST: 新しいカテゴリーを作成
export async function POST(request: Request) {
  const { name, color } = await request.json()

  if (!name || !color) {
    return NextResponse.json({ error: 'Name and color are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, color }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
} 