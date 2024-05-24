import { Link } from "react-router-dom"
const Index = () => {

    return <div className="h-full w-full flex flex-col justify-center items-center gap-[12px]">
        <h1 className="text-[32px]">404 Page Not Found</h1>

        <p className="text-[16px]">Sorry, the page you are looking for does not exist.</p>
        <p className="text-[16px]">Please check the URL or try the search bar.</p>

        <Link className="text-primary-2 hover:text-primary-4 underline" to="/">Go to Homepage</Link>
    </div>
}
export default Index