import { useEffect, useMemo, useState } from 'react'
import { ArrowUp, MessageSquare, Plus, Filter, Calendar, SortDesc, Loader2 } from 'lucide-react'

const API = import.meta.env.VITE_BACKEND_URL || ''

function useDeviceId() {
  const [id] = useState(() => {
    const key = 'vibehunt_device_id'
    let existing = localStorage.getItem(key)
    if (!existing) {
      existing = 'dev-' + Math.random().toString(36).slice(2)
      localStorage.setItem(key, existing)
    }
    return existing
  })
  return id
}

function classNames(...c) { return c.filter(Boolean).join(' ') }

function Header({ onNew }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-blue-500" />
          <h1 className="text-xl font-extrabold tracking-tight">VibeHunt</h1>
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">discover money-making vibes</span>
        </div>
        <button onClick={onNew} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition">
          <Plus className="h-4 w-4" /> New Idea
        </button>
      </div>
    </header>
  )
}

function Filters({ range, setRange, sort, setSort }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-gray-600"><Calendar className="h-4 w-4"/> Range</div>
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        {[
          {k:'all', label:'All time'},
          {k:'month', label:'This month'},
          {k:'week', label:'This week'},
        ].map(it => (
          <button key={it.k} onClick={()=>setRange(it.k)} className={classNames('px-3 py-1.5 rounded-md text-sm', range===it.k ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900')}>{it.label}</button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-gray-600 ml-auto"><SortDesc className="h-4 w-4"/> Sort</div>
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        {[
          {k:'votes', label:'Votes'},
          {k:'comments', label:'Comments'},
          {k:'latest', label:'Latest'},
        ].map(it => (
          <button key={it.k} onClick={()=>setSort(it.k)} className={classNames('px-3 py-1.5 rounded-md text-sm', sort===it.k ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900')}>{it.label}</button>
        ))}
      </div>
    </div>
  )
}

function PostCard({ post, onVote, onOpen }) {
  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer" onClick={()=>onOpen(post)}>
      <div className="flex items-start gap-4">
        <button onClick={(e)=>{e.stopPropagation(); onVote(post)}} className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95 transition">
          <ArrowUp className="h-4 w-4"/>
          <span className="text-xs font-semibold">{post.votes_count || 0}</span>
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-950">{post.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{post.tagline}</p>
              {post.maker && <p className="text-xs text-gray-500 mt-1">by {post.maker}</p>}
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <div className="inline-flex items-center gap-1 text-sm"><MessageSquare className="h-4 w-4"/>{post.comments_count || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Modal({ open, onClose, children }){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}/>
      <div className="relative z-10 max-w-xl w-[92vw] bg-white rounded-2xl p-5 shadow-xl border border-gray-200">
        {children}
      </div>
    </div>
  )
}

function CreatePost({ onSubmit, onCancel }){
  const [form, setForm] = useState({ title:'', tagline:'', maker:'', url:'' })
  const [loading, setLoading] = useState(false)
  const handle = async (e)=>{
    e.preventDefault()
    if(!form.title.trim() || !form.tagline.trim()) return
    setLoading(true)
    try{
      const res = await fetch(`${API}/api/posts`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
      const data = await res.json()
      onSubmit(data)
    } finally {
      setLoading(false)
    }
  }
  return (
    <form onSubmit={handle} className="space-y-4">
      <h3 className="text-lg font-semibold">Share a new idea</h3>
      <div className="grid grid-cols-1 gap-3">
        <input className="w-full px-3 py-2 border rounded-lg" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
        <input className="w-full px-3 py-2 border rounded-lg" placeholder="One-liner tagline" value={form.tagline} onChange={e=>setForm({...form, tagline:e.target.value})}/>
        <div className="grid grid-cols-2 gap-3">
          <input className="w-full px-3 py-2 border rounded-lg" placeholder="Maker (optional)" value={form.maker} onChange={e=>setForm({...form, maker:e.target.value})}/>
          <input className="w-full px-3 py-2 border rounded-lg" placeholder="Link (optional)" value={form.url} onChange={e=>setForm({...form, url:e.target.value})}/>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg border">Cancel</button>
        <button disabled={loading} className="px-3 py-2 rounded-lg bg-black text-white inline-flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin"/>}
          Post Idea
        </button>
      </div>
    </form>
  )
}

function PostDetail({ post, onClose, deviceId }){
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const load = async()=>{
      const res = await fetch(`${API}/api/posts/${post.id}/comments`)
      const data = await res.json()
      setComments(data)
    }
    load()
  }, [post.id])

  const add = async (e)=>{
    e.preventDefault()
    if(!text.trim()) return
    setLoading(true)
    try{
      const res = await fetch(`${API}/api/posts/${post.id}/comments`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content: text, device_id: deviceId }) })
      const c = await res.json()
      setComments([c, ...comments])
      setText('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <button onClick={async()=>{
            await fetch(`${API}/api/posts/${post.id}/vote`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ device_id: deviceId }) })
          }} className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg border hover:bg-gray-50">
            <ArrowUp className="h-4 w-4"/>
            <span className="text-xs font-semibold">{post.votes_count}</span>
          </button>
          <div>
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{post.tagline}</p>
            {post.url && <a className="text-sm text-blue-600 hover:underline" target="_blank" href={post.url}>Visit link</a>}
          </div>
        </div>

        <form onSubmit={add} className="flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add a comment..." className="flex-1 px-3 py-2 border rounded-lg"/>
          <button disabled={loading} className="px-3 py-2 rounded-lg bg-black text-white">Comment</button>
        </form>

        <div className="space-y-3 max-h-80 overflow-auto">
          {comments.map(c => (
            <div key={c.id} className="p-3 border rounded-lg">
              <p className="text-sm text-gray-800">{c.content}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(c.created_at).toLocaleString()}</p>
            </div>
          ))}
          {comments.length===0 && <p className="text-sm text-gray-500">No comments yet.</p>}
        </div>
      </div>
    </Modal>
  )
}

export default function VibeHuntUI(){
  const deviceId = useDeviceId()
  const [range, setRange] = useState('all') // all, month, week
  const [sort, setSort] = useState('votes') // votes, comments, latest
  const [items, setItems] = useState(null)
  const [open, setOpen] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const load = async ()=>{
    setItems(null)
    const res = await fetch(`${API}/api/posts?range=${range}&sort=${sort}`)
    const data = await res.json()
    setItems(data)
  }

  useEffect(()=>{ load() }, [range, sort])

  const vote = async (post)=>{
    const res = await fetch(`${API}/api/posts/${post.id}/vote`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ device_id: deviceId }) })
    const data = await res.json()
    setItems(items => items.map(it => it.id===post.id ? { ...it, votes_count: data.votes } : it))
  }

  const create = (p)=>{
    setShowCreate(false)
    setItems(items => [p, ...(items || [])])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-sky-50">
      <Header onNew={()=>setShowCreate(true)} />
      <main className="max-w-5xl mx-auto px-4">
        <Filters range={range} setRange={setRange} sort={sort} setSort={setSort} />
        <div className="grid gap-3">
          {items===null && <div className="flex items-center justify-center py-16 text-gray-500"><Loader2 className="h-5 w-5 mr-2 animate-spin"/> Loading vibes…</div>}
          {Array.isArray(items) && items.length===0 && <div className="text-center text-gray-500 py-16">No ideas yet. Be the first!</div>}
          {Array.isArray(items) && items.map(p => (
            <PostCard key={p.id} post={p} onVote={vote} onOpen={setOpen} />
          ))}
        </div>
      </main>

      <footer className="text-center text-sm text-gray-500 py-12">Built with ❤️ on Flames.Blue</footer>

      <Modal open={showCreate} onClose={()=>setShowCreate(false)}>
        <CreatePost onSubmit={create} onCancel={()=>setShowCreate(false)} />
      </Modal>

      {open && <PostDetail post={open} onClose={()=>setOpen(null)} deviceId={deviceId} />}
    </div>
  )
}
