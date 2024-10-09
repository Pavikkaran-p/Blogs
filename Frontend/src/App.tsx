import { BrowserRouter, Route, Routes } from 'react-router-dom'
// import Signup from './pages/Signup.tsx'
// import Signin from './pages/Signin.tsx'
// import Blog from './pages/Blog.tsx'
// import Blogs from './pages/Blogs.tsx'
// import { Publish } from './pages/Publish.tsx'
import Landing from './components/Landing.tsx'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Landing/>} />
          {/* <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/publish" element={<Publish />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App