import React, { useEffect } from 'react';
import './BlogsCarousel.css';

const BlogCarouselSection = ({ blogs }) => {
  // Default blogs data if none is provided
  const defaultBlogs = [
    {
      id: 1,
      image: "https://cdn.pixabay.com/photo/2019/03/10/18/31/hong-kong-4046913_960_720.jpg",
      title: "We are best for any industrial & business solution.",
      author: "Alexa",
      date: "August 1, 2020",
      excerpt: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem...",
      link: "#"
    },
    {
      id: 2,
      image: "https://cdn.pixabay.com/photo/2015/07/09/22/45/tree-838667_960_720.jpg",
      title: "We are best for any industrial & business solution.",
      author: "Alexa",
      date: "August 1, 2020",
      excerpt: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem...",
      link: "#"
    },
    {
      id: 3,
      image: "https://cdn.pixabay.com/photo/2015/10/30/20/13/sunrise-1014712_960_720.jpg",
      title: "We are best for any industrial & business solution.",
      author: "Alexa",
      date: "August 1, 2020",
      excerpt: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem...",
      link: "#"
    }
  ];

  const blogsToDisplay = blogs || defaultBlogs;

  useEffect(() => {
    // Initialize OwlCarousel when component mounts
    const $ = window.jQuery;
    if ($ && $.fn.owlCarousel) {
      $('.owl-carousel').owlCarousel({
        loop: true,
        margin: 10,
        dots: false,
        nav: true,
        autoplay: true,
        smartSpeed: 3000,
        autoplayTimeout: 7000,
        responsive: {
          0: {
            items: 1
          },
          600: {
            items: 2
          },
          1000: {
            items: 3
          }
        }
      });
    } else {
      console.error('jQuery or OwlCarousel is not loaded');
    }

    // Cleanup function to destroy carousel when component unmounts
    return () => {
      const $ = window.jQuery;
      if ($ && $.fn.owlCarousel) {
        $('.owl-carousel').owlCarousel('destroy');
      }
    };
  }, []);

  return (
    <section className="blog_section">
      <div className="container">
        <div className="blog_content">
          <div className="owl-carousel owl-theme">
            {blogsToDisplay.map(blog => (
              <div className="blog_item" key={blog.id}>
                <div className="blog_image">
                  <img className="img-fluid" src={blog.image} alt="Blog thumbnail" />
                  <span><i className="icon ion-md-create"></i></span>
                </div>
                <div className="blog_details">
                  <div className="blog_title">
                    <h5><a href={blog.link}>{blog.title}</a></h5>
                  </div>
                  <ul>
                    <li><i className="icon ion-md-person"></i>{blog.author}</li>
                    <li><i className="icon ion-md-calendar"></i>{blog.date}</li>
                  </ul>
                  <p>{blog.excerpt}</p>
                  <a href={blog.link}>Read More<i className="icon ion-ios-arrow-forward"></i></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogCarouselSection;