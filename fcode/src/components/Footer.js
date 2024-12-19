import "../App.css";

const Footer = () => {
  return (
    <footer className="footer text-center ">
      <div className="container">
        <h4 className="mb-3">Subscribe to our Newsletter</h4>
        <form className="d-flex justify-content-center mb-3">
          <input
            type="email"
            className="form-control me-2"
            placeholder="Enter your email"
            style={{ width: "300px" }}
          />
          <button className="btn btn-primary" type="submit">
            Submit
          </button>
        </form>

        <hr className="my-3" />

        <div className="d-flex justify-content-between align-items-center">
          <div className="brand-name">
            <p>BiblioMetrix</p>
          </div>
          <div className="footer-text">
            <p>© 2024 Brand, Inc. · Privacy · Terms · Sitemap</p>
          </div>
          <div className="social-icons">
            <button className="me-3 btn btn-link">
              <i className="fab fa-facebook"></i>
            </button>
            <button className="me-3 btn btn-link">
              <i className="fab fa-twitter"></i>
            </button>
            <button className="me-3 btn btn-link">
              <i className="fab fa-instagram"></i>
            </button>
            <button className="me-3 btn btn-link">
              <i className="fab fa-github"></i>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
