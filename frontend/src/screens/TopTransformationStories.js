import React, { useEffect, useRef } from "react";
import "./TopTransformationStories.css";
import logo from "../media/logo.png";
import v from "../media/mov_bbb.mp4";

// Import Swiper and required modules
import { Swiper, SwiperSlide } from "swiper/react";
import {
	EffectCoverflow,
	Pagination,
	Keyboard,
	Mousewheel,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

const videos = [
	{
		id: 1,
		title: "Video 1: Fitness Transformation",
		description: "Watch how this individual transformed their fitness journey.",
		videoUrl: v,
	},
	{
		id: 2,
		title: "Video 2: Weight Loss Success",
		description: "A story of a dramatic weight loss transformation.",
		videoUrl: v,
	},
	{
		id: 3,
		title: "Video 3: Health Transformation",
		description:
			"See how someone changed their life through a health-focused approach.",
		videoUrl: v,
	},
	{
		id: 4,
		title: "Video 4: Bodybuilding Journey",
		description: "A bodybuilding transformation story that will inspire you.",
		videoUrl: v,
	},
	{
		id: 5,
		title: "Video 5: Overcoming Adversity",
		description: "A powerful story of overcoming challenges through fitness.",
		videoUrl: v,
	},
];

const blogs = [
	{
		id: 1,
		title: "Mindset for Transformation",
		description: "How a change in mindset can lead to life transformation.",
		imageUrl: logo,
		link: "https://bestselfatlanta.com/blog1",
	},
	{
		id: 2,
		title: "Healthy Eating Tips",
		description: "Learn the best eating habits to stay fit and healthy.",
		imageUrl: logo,
		link: "https://bestselfatlanta.com/blog2",
	},
	{
		id: 3,
		title: "Fitness and Mental Health",
		description:
			"Explore the connection between fitness and mental well-being.",
		imageUrl: logo,
		link: "https://bestselfatlanta.com/blog3",
	},
	{
		id: 4,
		title: "Overcoming Obstacles",
		description:
			"How to push through challenges on your transformation journey.",
		imageUrl: logo,
		link: "https://bestselfatlanta.com/blog4",
	},
	{
		id: 5,
		title: "Importance of Rest",
		description:
			"Why rest is essential for your fitness and health transformation.",
		imageUrl: logo,
		link: "https://bestselfatlanta.com/blog5",
	},
];

const SwiperCarouselSection = ({ items, sectionType }) => {
	const handleVideoClick = (videoElement) => {
		if (videoElement.paused || videoElement.ended) {
			videoElement.play();
		} else {
			videoElement.pause();
		}
	};

	return (
		<div className="swiper-carousel-section">
			<h2>{sectionType} Highlights</h2>
			<Swiper
				effect={"coverflow"}
				grabCursor={true}
				centeredSlides={true}
				slidesPerView={"auto"}
				spaceBetween={30}
				coverflowEffect={{
					rotate: 0,
					stretch: 0,
					depth: 100,
					modifier: 3,
					slideShadows: true,
				}}
				keyboard={{ enabled: true }}
				mousewheel={{ thresholdDelta: 70 }}
				loop={true}
				pagination={{
					el: `.swiper-pagination-${sectionType.toLowerCase()}`,
					clickable: true,
					dynamicBullets: true,
				}}
				modules={[EffectCoverflow, Pagination, Keyboard, Mousewheel]}
				breakpoints={{
					640: { slidesPerView: 2, spaceBetween: 20 },
					768: { slidesPerView: 1, spaceBetween: 30 },
					1024: { slidesPerView: 2, spaceBetween: 30 },
					1560: { slidesPerView: 3, spaceBetween: 30 },
				}}
			>
				{items.map((item) => (
					<SwiperSlide key={item.id}>
						<div className="swiper-slide-content">
							{sectionType === "Video" ? (
								<video
									className="swiper-slide-video"
									src={item.videoUrl}
									preload="metadata"
									onClick={(e) => handleVideoClick(e.target)}
									controls={false}
								/>
							) : (
								<a href={item.link} target="_blank" rel="noopener noreferrer">
									<img
										className="swiper-slide-image"
										src={item.imageUrl}
										alt={item.title}
									/>
								</a>
							)}
							<div className="swiper-slide-text">
								<h2>{item.title}</h2>
								<p>{item.description}</p>
							</div>
						</div>
					</SwiperSlide>
				))}
				<div
					className={`swiper-pagination swiper-pagination-${sectionType.toLowerCase()}`}
				></div>
			</Swiper>
		</div>
	);
};

const TopTransformation = () => {
	return (
		<div className="top-transformation">
			<SwiperCarouselSection items={videos} sectionType="Video" />
			<SwiperCarouselSection items={blogs} sectionType="Blog" />
		</div>
	);
};

export default TopTransformation;
