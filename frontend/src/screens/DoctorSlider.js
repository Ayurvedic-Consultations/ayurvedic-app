import React from "react";

// Data of doctors
const doctors = [
	{
		name: "Rajiv Makhni",
		videoTitle: "Gabit Smart Ring",
		instagramFollowers: "1.5M followers",
		youtubeSubscribers: "117K subscribers",
		imgSrc:
			"https://res.cloudinary.com/dmezmffej/image/upload/v1722071358/Group_3015756_1.avif",
	},
	{
		name: "Anupriya Kapur",
		videoTitle: "Fitness & Nutrition Plan",
		instagramFollowers: "257K followers",
		youtubeSubscribers: "13K subscribers",
		imgSrc:
			"https://res.cloudinary.com/dmezmffej/image/upload/v1721908681/Frame_48097830_1_1.avif",
	},
	{
		name: "Archis Patil",
		videoTitle: "Fitness & Nutrition Plan + Smart Ring",
		instagramFollowers: "214K followers",
		youtubeSubscribers: "5.8K subscribers",
		imgSrc:
			"https://res.cloudinary.com/dmezmffej/image/upload/v1721909012/Screenshot_2024-07-25_at_5.28.21_PM_1.avif",
	},
	{
		name: "Tridev Pandey",
		videoTitle: "Gabit Smart Ring",
		instagramFollowers: "74K followers",
		youtubeSubscribers: "",
		imgSrc:
			"https://res.cloudinary.com/dmezmffej/image/upload/v1721891491/Frame_48097828.avif",
	},
	{
		name: "Mansi Choudhary",
		videoTitle: "Fitness & Nutrition Plan",
		instagramFollowers: "42K followers",
		youtubeSubscribers: "2.8K subscribers",
		imgSrc:
			"https://res.cloudinary.com/dmezmffej/image/upload/v1721891491/Frame_48097827.avif",
	},
	{
		name: "Barnali",
		videoTitle: "Ceramide & Hyaluronic Face Moisturiser",
		instagramFollowers: "13K followers",
		youtubeSubscribers: "",
		imgSrc:
			"https://res.cloudinary.com/dmezmffej/image/upload/v1721908681/Frame_48097830_2.avif",
	},
	{
		name: "Jeku Jacob",
		videoTitle: "Ceramide & Hyaluronic Face Moisturiser",
		instagramFollowers: "10K followers",
		youtubeSubscribers: "",
		imgSrc:
			"https://res.cloudinary.com/dmezmffej/image/upload/v1721891491/Frame_48097826.avif",
	},
	{
		name: "Khushboo",
		videoTitle: "Radiant & Clear Skin Kit",
		instagramFollowers: "4.0K followers",
		youtubeSubscribers: "1.2K subscribers",
		imgSrc:
			"https://res.cloudinary.com/dmezmffej/image/upload/v1721891491/Frame_48097824.avif",
	},
	{
		name: "Dr. Aditi Gupta",
		videoTitle: "20% Vitamin C Face Serum",
		instagramFollowers: "",
		youtubeSubscribers: "",
		imgSrc:
			"https://res.cloudinary.com/dmezmffej/image/upload/v1721891477/Frame_48097829.avif",
	},
];

// Individual doctor video card component
const doctorCard = ({ doctor }) => {
	return (
		<div className="doctorVideoCard_doctorVideoCard__CzuIz">
			<div className="Image_wrapper__bkC8Y doctorVideoCard_doctorVideoCardThumbnailImg___KJdV">
				<img
					src={doctor.imgSrc}
					alt={doctor.name}
					loading="lazy"
					decoding="async"
				/>
			</div>
			<div className="doctorVideoCard_doctorVideoCardContentSection___PQHB">
				<p className="title3-bold-m title2-bold-d">{doctor.name}</p>
				<p className="doctorVideoCard_subTitle__qs_1z body3-regular-m body2-regular-d">
					{doctor.videoTitle}
				</p>
				<div className="doctorVideoCard_hrSeparator__8AxbM"></div>
				<div className="doctorVideoCard_socialProfileStats__XHydG">
					<div className="doctorVideoCard_socialProfileStatsContent__G2061">
						<div className="Image_wrapper__bkC8Y doctorVideoCard_socialProfileStatsIcon__owGIK">
							<img
								src="https://assets.prod.gabit.com/2024-12-05-6ac279c/_next/static/media/footerInstagramIcon.607aa012.svg"
								alt="instagram-icon"
							/>
						</div>
						<p className="body3-semibold-m body2-semibold-d">
							{doctor.instagramFollowers}
						</p>
					</div>
					<div className="doctorVideoCard_socialProfileStatsContent__G2061">
						<div className="Image_wrapper__bkC8Y doctorVideoCard_socialProfileStatsIcon__owGIK">
							<img
								src="https://assets.prod.gabit.com/2024-12-05-6ac279c/_next/static/media/youtube.61f2e507.svg"
								alt="youtube-icon"
							/>
						</div>
						<p className="body3-semibold-m body2-semibold-d">
							{doctor.youtubeSubscribers}
						</p>
					</div>
				</div>
			</div>
			<i className="icon-play doctorVideoCard_playIcon__MNyKT"></i>
		</div>
	);
};

// Main component that renders the doctor video cards
const doctorSlider = () => {
	return (
		<div id="reels">
			<div className="slick-track">
				{doctors.map((doctor, index) => (
					<doctorCard key={index} doctor={doctor} />
				))}
			</div>
		</div>
	);
};

export default doctorSlider;
