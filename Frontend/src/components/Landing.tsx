import { Link } from "react-router-dom"

const Landing = () => {
  return (
    <>
    <div>
        <h1 className="text-2xl font-bold font-sans text-center mt-10">Blog App</h1>
    </div>
    <div className="flex flex-col">
        <button className="bg-green-200 mx-80 max-h-12 text-2xl font-bold font-sans text-center mt-10 rounded-xl px-4">
            <Link to={'/signup'}>Sign Up</Link>
        </button>
        <button className="bg-green-200 mx-80 max-h-12 text-2xl font-bold font-sans text-center mt-10 rounded-xl px-4">
            <Link to={'/signin'}>Sign In</Link>
        </button>

    </div>
    </>
  )
}

export default Landing