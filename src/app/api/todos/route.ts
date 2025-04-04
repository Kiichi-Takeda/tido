import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: 全TODOを取得（カテゴリー情報を含む）
export async function GET() {
  const { data, error } = await supabase
    .from('todos')
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .order('due_date', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST: 新しいTODOを作成
export async function POST(request: Request) {
  const { title, due_date, category_id } = await request.json()

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('todos')
    .insert([{ title, due_date, category_id }])
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PUT: TODOを更新
export async function PUT(request: Request) {
  const { id, title, completed, due_date, category_id } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('todos')
    .update({ title, completed, due_date, category_id })
    .eq('id', id)
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE: TODOを削除
export async function DELETE(request: Request) {
  const { id } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
} 