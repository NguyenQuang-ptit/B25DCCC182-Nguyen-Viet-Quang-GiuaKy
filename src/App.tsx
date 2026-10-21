import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import './App.css'

type Post = {
  id: number
  userId: number
  title: string
  body: string
  author?: string
  createdAt?: string
}

type Comment = {
  id: number
  postId: number
  name: string
  email: string
  body: string
}

const API_URL = 'https://jsonplaceholder.typicode.com'
const LOCAL_POSTS_KEY = 'miniblog_posts'
const LOGIN_KEY = 'miniblog_login'

const vietnameseTitles = [
  'Học React cơ bản cho người mới bắt đầu',
  'Làm việc nhóm hiệu quả trong dự án web',
  'Những mẹo viết code sạch và dễ bảo trì',
  'Phát triển UI bằng TypeScript',
  'Cách tối ưu UX trong ứng dụng blog',
  'Kỹ năng lập trình cần có trong năm 2026',
  'Tạo dự án frontend nhanh với Vite',
  'Nên học JavaScript trước hay TypeScript trước?',
  'Cách quản lý state đơn giản trong React',
  'Lập trình web hiện đại và xu hướng mới',
]

const vietnameseBodies = [
  'React là một thư viện mạnh mẽ để xây dựng giao diện người dùng. Với kiến thức cơ bản, bạn có thể tạo được các ứng dụng nhỏ, đẹp và dễ mở rộng. Việc hiểu rõ component, props và state sẽ giúp bạn làm việc tốt hơn trong dự án thực tế.',
  'Làm việc nhóm hiệu quả giúp dự án tiến nhanh hơn và giảm lỗi. Việc chia công việc rõ ràng, giao tiếp thường xuyên và review code định kỳ là những yếu tố rất quan trọng khi làm việc cùng nhau.',
  'Code sạch không chỉ dễ đọc mà còn dễ bảo trì trong tương lai. Hãy tuân thủ naming rõ ràng, tránh logic lặp và tách logic phức tạp thành các hàm nhỏ để code dễ hiểu hơn.',
  'TypeScript giúp phát hiện lỗi sớm hơn và tăng tính an toàn cho mã nguồn. Khi dự án lớn dần, TypeScript giúp bạn quản lý dữ liệu và API tốt hơn rất nhiều.',
  'Trải nghiệm người dùng là yếu tố quan trọng giúp ứng dụng thu hút người dùng. Thiết kế đơn giản, bố cục rõ ràng và tương tác mượt mà sẽ nâng cao sự hài lòng khi dùng sản phẩm.',
  'Trong môi trường công nghệ hiện nay, kỹ năng lập trình cần được cập nhật liên tục. Việc học tập đều đặn và thực hành dự án thực tế là cách hiệu quả nhất để nâng cao trình độ.',
  'Vite giúp khởi tạo và chạy dự án frontend rất nhanh. Với tốc độ build tốt và cấu hình đơn giản, nó phù hợp cho việc học tập và phát triển ứng dụng web hiện đại.',
  'JavaScript và TypeScript đều quan trọng, nhưng nếu dự án yêu cầu tuần tự rõ ràng và kiểm tra kiểu dữ liệu, TypeScript sẽ là lựa chọn hợp lý hơn cho nhiều dự án lớn.',
  'Quản lý state là một phần quan trọng trong ứng dụng React. Dù dùng useState hay các giải pháp khác, điều quan trọng là giữ dữ liệu nhất quán và dễ kiểm soát khi ứng dụng phát triển.',
  'Lập trình web hiện đại không chỉ là HTML, CSS và JavaScript mà còn bao gồm trải nghiệm người dùng, hiệu năng, accessibility và khả năng tương thích trên nhiều thiết bị.',
]

const vietnameseComments = [
  'Bài viết rất hay và dễ hiểu, mình đã học được nhiều điều mới.',
  'Cảm ơn tác giả vì chia sẻ những kinh nghiệm thực tế rất hữu ích.',
  'Mình thích cách trình bày rõ ràng và ngắn gọn, dễ tiếp cận.',
  'Thông tin rất bổ ích cho người mới bắt đầu học lập trình web.',
  'Tôi đã áp dụng một vài gợi ý trong dự án và thấy hiệu quả.',
  'Nội dung rất sâu sắc, phù hợp cho cả người mới và người đã có kinh nghiệm.',
  'Mình thích phần hướng dẫn rõ ràng, dễ làm theo từng bước.',
  'Chia sẻ rất thực tế, không bị lan man và rất dễ hiểu.',
  'Bài viết này giúp mình hiểu rõ hơn về cách làm việc nhóm trong dự án.',
  'Rất đáng để lưu lại và đọc lại nhiều lần khi cần tham khảo.',
]

const formatVietnamesePost = (post: Post, index: number): Post => ({
  ...post,
  title: vietnameseTitles[index % vietnameseTitles.length],
  body: vietnameseBodies[index % vietnameseBodies.length],
  author: 'admin',
})

const formatVietnameseComments = (comments: Comment[], postId: number): Comment[] =>
  comments.map((comment, index) => ({
    ...comment,
    postId,
    name: `Người đọc ${postId}-${index + 1}`,
    email: `reader${postId}${index + 1}@gmail.com`,
    body: vietnameseComments[(index + postId) % vietnameseComments.length],
  }))

const getLocalPosts = (): Post[] => {
  const raw = localStorage.getItem(LOCAL_POSTS_KEY)
  if (!raw) return []

  try {
    const data = JSON.parse(raw) as Post[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

const saveLocalPosts = (posts: Post[]) => {
  localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(posts))
}

function App() {
  const [remotePosts, setRemotePosts] = useState<Post[]>([])
  const [localPosts, setLocalPosts] = useState<Post[]>(() => getLocalPosts())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem(LOGIN_KEY) === 'true',
  )

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${API_URL}/posts`)
        if (!response.ok) throw new Error('Không thể tải dữ liệu bài viết.')

        const data = (await response.json()) as Post[]
        setRemotePosts(data.map((post, index) => formatVietnamesePost(post, index)))
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải bài viết.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadPosts()
  }, [])

  useEffect(() => {
    localStorage.setItem(LOGIN_KEY, String(isLoggedIn))
  }, [isLoggedIn])

  const posts = [...localPosts, ...remotePosts]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5)

  const handleAddPost = (post: Post) => {
    const next = [post, ...localPosts]
    setLocalPosts(next)
    saveLocalPosts(next)
  }

  const handleLogin = (username: string, password: string) => {
    if (username === 'admin' && password === '123456') {
      setIsLoggedIn(true)
      return true
    }
    return false
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header isLoggedIn={isLoggedIn} onLogout={() => setIsLoggedIn(false)} />

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={<HomePage posts={posts} loading={loading} error={error} />}
            />
            <Route path="/posts/:id" element={<PostDetailPage posts={posts} />} />
            <Route
              path="/write"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <WritePostPage onAddPost={handleAddPost} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={<LoginPage onLogin={handleLogin} isLoggedIn={isLoggedIn} />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function Header({ isLoggedIn, onLogout }: { isLoggedIn: boolean; onLogout: () => void }) {
  return (
    <header className="topbar">
      <Link to="/" className="brand">MiniBlog</Link>

      <nav className="nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Trang chủ
        </NavLink>
        <NavLink to="/write" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Viết bài
        </NavLink>
      </nav>

      {isLoggedIn ? (
        <button className="btn btn-dark" type="button" onClick={onLogout}>
          Đăng xuất
        </button>
      ) : (
        <Link to="/login" className="btn btn-primary">
          Đăng nhập
        </Link>
      )}
    </header>
  )
}

function HomePage({
  posts,
  loading,
  error,
}: {
  posts: Post[]
  loading: boolean
  error: string
}) {
  const [search, setSearch] = useState('')

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="label">BLOG</p>
          <h1>Bài viết mới</h1>
        </div>

        <label className="search-box">
          <span>Tìm kiếm</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nhập tiêu đề bài viết"
          />
        </label>
      </div>

      {loading && <div className="message info">Đang tải dữ liệu...</div>}
      {!loading && error && <div className="message error">{error}</div>}
      {!loading && !error && filteredPosts.length === 0 && (
        <div className="message">Không có bài viết nào.</div>
      )}

      {!loading && !error && filteredPosts.length > 0 && (
        <div className="grid">
          {filteredPosts.map((post) => (
            <article key={post.id} className="card">
              <span className="tag">{post.author ?? 'admin'}</span>
              <h2>{post.title}</h2>
              <p>{post.body.slice(0, 120)}...</p>
              <div className="card-footer">
                <small>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'Mới'}</small>
                <Link to={`/posts/${post.id}`} className="read-more">
                  Xem chi tiết
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function PostDetailPage({ posts }: { posts: Post[] }) {
  const { id } = useParams()
  const postId = Number(id)
  const post = posts.find((item) => item.id === postId)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadComments = async () => {
      if (!postId) {
        setComments([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${API_URL}/comments?postId=${postId}`)
        if (!response.ok) throw new Error('Không thể tải bình luận.')

        const data = (await response.json()) as Comment[]
        setComments(formatVietnameseComments(data, postId))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải bình luận.')
      } finally {
        setLoading(false)
      }
    }

    void loadComments()
  }, [postId])

  if (!post) return <NotFoundPage />

  return (
    <section className="page">
      <Link to="/" className="back-link">← Quay lại</Link>

      <article className="detail-box">
        <p className="label">{post.author ?? 'admin'}</p>
        <h1>{post.title}</h1>
        <p className="content">{post.body}</p>
      </article>

      <div className="comment-box">
        <h2>Bình luận</h2>

        {loading && <div className="message info">Đang tải bình luận...</div>}
        {!loading && error && <div className="message error">{error}</div>}
        {!loading && !error && comments.length === 0 && (
          <div className="message">Chưa có bình luận nào.</div>
        )}

        {!loading && !error && comments.length > 0 && (
          <ul className="comment-list">
            {comments.map((comment) => (
              <li key={comment.id} className="comment-item">
                <h3>{comment.name}</h3>
                <small>{comment.email}</small>
                <p>{comment.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function WritePostPage({ onAddPost }: { onAddPost: (post: Post) => void }) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimTitle = title.trim()
    const trimBody = body.trim()

    if (!trimTitle || trimTitle.length < 5) {
      setError('Tiêu đề phải có ít nhất 5 ký tự.')
      return
    }

    if (!trimBody || trimBody.length < 20) {
      setError('Nội dung phải có ít nhất 20 ký tự.')
      return
    }

    const newPost: Post = {
      id: Date.now(),
      userId: 1,
      title: trimTitle,
      body: trimBody,
      author: 'admin',
      createdAt: new Date().toISOString(),
    }

    onAddPost(newPost)
    navigate('/')
  }

  return (
    <section className="page">
      <div className="form-box">
        <p className="label">VIẾT BÀI</p>
        <h1>Thêm bài viết mới</h1>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <label>
            <span>Tiêu đề</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nhập tiêu đề"
            />
          </label>

          <label>
            <span>Nội dung</span>
            <textarea
              rows={7}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Viết nội dung bài viết..."
            />
          </label>

          {error && <div className="message error">{error}</div>}
          <button type="submit" className="btn btn-primary submit-btn">
            Đăng bài
          </button>
        </form>
      </div>
    </section>
  )
}

function LoginPage({
  onLogin,
  isLoggedIn,
}: {
  onLogin: (username: string, password: string) => boolean
  isLoggedIn: boolean
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isLoggedIn) navigate(from, { replace: true })
  }, [from, isLoggedIn, navigate])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập tài khoản và mật khẩu.')
      return
    }

    const ok = onLogin(username.trim(), password.trim())
    if (!ok) {
      setError('Sai tài khoản hoặc mật khẩu.')
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <section className="page">
      <div className="form-box small-box">
        <p className="label">ĐĂNG NHẬP</p>
        <h1>Admin</h1>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <label>
            <span>Tài khoản</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin"
            />
          </label>

          <label>
            <span>Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="123456"
            />
          </label>

          <div className="hint">Tài khoản demo: admin / 123456</div>
          {error && <div className="message error">{error}</div>}

          <button className="btn btn-primary submit-btn" type="submit">
            Đăng nhập
          </button>
        </form>
      </div>
    </section>
  )
}

function ProtectedRoute({ isLoggedIn, children }: { isLoggedIn: boolean; children: React.ReactNode }) {
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

function NotFoundPage() {
  return (
    <section className="page center-page">
      <div className="message not-found">
        <h1>404</h1>
        <p>Trang không tồn tại.</p>
        <Link to="/" className="btn btn-primary">
          Về trang chủ
        </Link>
      </div>
    </section>
  )
}

export default App
