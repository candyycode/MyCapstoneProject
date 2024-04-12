import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="home">
            <h1>Your Ultimate Pet Store</h1>
            <p>We are a proud ultimate pet store that carries a variety of animal supplies and pet accessories. 
                We carry top of the line products that you won't find in your local pet store!  </p>
            <h3>
                Follow this link to see our available inventory!
                    <Link to="/products"> here</Link>
            </h3>
        </div>
    );
}