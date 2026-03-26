import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import './PrakritiAssessment.css';

// Bilingual UI Text Dictionary
const UI_TEXT = {
	resultsTitle: { en: 'Your Prakriti Assessment Result', hi: 'आपका प्रकृति मूल्यांकन परिणाम' },
	resultsSub: { en: 'This is your birth constitution (Prakriti).', hi: 'यह आपकी जन्म प्रकृति (Birth Constitution) है।' },
	btnRetake: { en: 'Retake Assessment', hi: 'फिर से मूल्यांकन करें' },
	btnBack: { en: 'Back', hi: 'पीछे' },
	btnContinue: { en: 'Continue', hi: 'आगे बढ़ें' },
	btnSubmit: { en: 'Submit Assessment', hi: 'मूल्यांकन जमा करें' }
};

const OPTIONS = [
	{ label: { en: 'Never', hi: 'कभी नहीं' }, value: 0 },
	{ label: { en: 'Rarely', hi: 'शायद ही कभी' }, value: 1 },
	{ label: { en: 'Sometimes', hi: 'कभी-कभी' }, value: 2 },
	{ label: { en: 'Often', hi: 'अक्सर' }, value: 3 },
	{ label: { en: 'Always', hi: 'हमेशा' }, value: 4 },
];

const DOSHA_DATA = {
	kapha: {
		title: 'Kapha',
		color: '#4caf50',
		bgColor: '#e8f5e9',
		description: {
			en: 'Kapha represents stability, strength, and structure.',
			hi: 'कफ स्थिरता, शक्ति और शरीर की संरचना का प्रतिनिधित्व करता है।'
		},
		questions: [
			{ id: 'k1', category: { en: 'Body (Sharira)', hi: 'शरीर' }, text: { en: 'My body is broad and well built.', hi: 'मेरा शरीर चौड़ा और सुगठित है।' } },
			{ id: 'k2', category: { en: 'Body (Sharira)', hi: 'शरीर' }, text: { en: 'I gain weight easily even with small food intake.', hi: 'कम खाना खाने पर भी मेरा वजन आसानी से बढ़ जाता है।' } },
			{ id: 'k3', category: { en: 'Body (Sharira)', hi: 'शरीर' }, text: { en: 'My skin feels soft, thick and slightly oily.', hi: 'मेरी त्वचा मुलायम, मोटी और थोड़ी तैलीय है।' } },
			{ id: 'k4', category: { en: 'Body (Sharira)', hi: 'शरीर' }, text: { en: 'My hair is thick, smooth and dense.', hi: 'मेरे बाल घने, चिकने और मोटे हैं।' } },
			{ id: 'k5', category: { en: 'Body (Sharira)', hi: 'शरीर' }, text: { en: 'I have good stamina and endurance.', hi: 'मेरे अंदर अच्छी सहनशक्ति (stamina) है।' } },
			{ id: 'k6', category: { en: 'Metabolism', hi: 'चयापचय' }, text: { en: 'My digestion is slow but stable.', hi: 'मेरा पाचन धीमा लेकिन स्थिर है।' } },
			{ id: 'k7', category: { en: 'Metabolism', hi: 'चयापचय' }, text: { en: 'I do not feel hunger frequently.', hi: 'मुझे बार-बार भूख नहीं लगती है।' } },
			{ id: 'k8', category: { en: 'Metabolism', hi: 'चयापचय' }, text: { en: 'I prefer sweet, heavy and oily foods.', hi: 'मुझे मीठा, भारी और तैलीय भोजन पसंद है।' } },
			{ id: 'k9', category: { en: 'Mind', hi: 'मन' }, text: { en: 'I am calm and emotionally stable.', hi: 'मैं शांत और भावनात्मक रूप से स्थिर हूँ।' } },
			{ id: 'k10', category: { en: 'Mind', hi: 'मन' }, text: { en: 'I forgive easily and avoid conflicts.', hi: 'मैं आसानी से क्षमा कर देता हूँ और विवादों से बचता हूँ।' } },
			{ id: 'k11', category: { en: 'Mind', hi: 'मन' }, text: { en: 'I sleep deeply and for long hours.', hi: 'मैं गहरी और लंबी नींद लेता हूँ।' } },
			{ id: 'k12', category: { en: 'Mind', hi: 'मन' }, text: { en: 'I dislike physical exertion.', hi: 'मुझे शारीरिक मेहनत करना ज्यादा पसंद नहीं है।' } },
		]
	},
	pitta: {
		title: 'Pitta',
		color: '#ff9800',
		bgColor: '#fff3e0',
		description: {
			en: 'Pitta represents digestion, metabolism, and energy production.',
			hi: 'पित्त पाचन, चयापचय (metabolism) और ऊर्जा उत्पादन का प्रतिनिधित्व करता है।'
		},
		questions: [
			{ id: 'p1', category: { en: 'Body & Heat', hi: 'शरीर और ताप' }, text: { en: 'My body is medium build.', hi: 'मेरा शरीर मध्यम आकार का है।' } },
			{ id: 'p2', category: { en: 'Body & Heat', hi: 'शरीर और ताप' }, text: { en: 'My body feels warm most of the time.', hi: 'मेरा शरीर ज्यादातर समय गर्म रहता है।' } },
			{ id: 'p3', category: { en: 'Body & Heat', hi: 'शरीर और ताप' }, text: { en: 'I sweat easily.', hi: 'मुझे आसानी से पसीना आता है।' } },
			{ id: 'p4', category: { en: 'Body & Heat', hi: 'शरीर और ताप' }, text: { en: 'My skin is sensitive or prone to rashes.', hi: 'मेरी त्वचा संवेदनशील है या चकत्ते (rashes) जल्दी होते हैं।' } },
			{ id: 'p5', category: { en: 'Body & Heat', hi: 'शरीर और ताप' }, text: { en: 'I feel very hungry at regular intervals.', hi: 'मुझे नियमित अंतराल पर बहुत तेज भूख लगती है।' } },
			{ id: 'p6', category: { en: 'Digestion', hi: 'पाचन' }, text: { en: 'I cannot tolerate skipping meals.', hi: 'मैं भोजन छोड़ना (skip करना) बर्दाश्त नहीं कर सकता।' } },
			{ id: 'p7', category: { en: 'Digestion', hi: 'पाचन' }, text: { en: 'I prefer cold food and drinks.', hi: 'मुझे ठंडा भोजन और पेय पसंद हैं।' } },
			{ id: 'p8', category: { en: 'Digestion', hi: 'पाचन' }, text: { en: 'I dislike hot weather.', hi: 'मुझे गर्म मौसम पसंद नहीं है।' } },
			{ id: 'p9', category: { en: 'Mind', hi: 'मन' }, text: { en: 'I am ambitious and competitive.', hi: 'मैं महत्वाकांक्षी और प्रतिस्पर्धी (competitive) हूँ।' } },
			{ id: 'p10', category: { en: 'Mind', hi: 'मन' }, text: { en: 'I get irritated easily.', hi: 'मैं आसानी से चिड़चिड़ा हो जाता हूँ।' } },
			{ id: 'p11', category: { en: 'Mind', hi: 'मन' }, text: { en: 'I speak directly and confidently.', hi: 'मैं स्पष्ट और आत्मविश्वास के साथ बोलता हूँ।' } },
			{ id: 'p12', category: { en: 'Mind', hi: 'मन' }, text: { en: 'I prefer leadership roles.', hi: 'मुझे नेतृत्व (leadership) की भूमिकाएं पसंद हैं।' } },
		]
	},
	vata: {
		title: 'Vata',
		color: '#2196f3',
		bgColor: '#e3f2fd',
		description: {
			en: 'Vata represents movement, breathing, and the nervous system.',
			hi: 'वात शरीर में गति, श्वास और तंत्रिका तंत्र (nervous system) का प्रतिनिधित्व करता है।'
		},
		questions: [
			{ id: 'v1', category: { en: 'Body (Sharira)', hi: 'शरीर' }, text: { en: 'My body frame is thin or light.', hi: 'मेरे शरीर का ढांचा पतला या हल्का है।' } },
			{ id: 'v2', category: { en: 'Body (Sharira)', hi: 'शरीर' }, text: { en: 'I lose weight easily.', hi: 'मेरा वजन आसानी से कम हो जाता है।' } },
			{ id: 'v3', category: { en: 'Body (Sharira)', hi: 'शरीर' }, text: { en: 'My skin is dry or rough.', hi: 'मेरी त्वचा रूखी या खुरदरी है।' } },
			{ id: 'v4', category: { en: 'Body (Sharira)', hi: 'शरीर' }, text: { en: 'My hair is dry or frizzy.', hi: 'मेरे बाल रूखे या उलझे हुए हैं।' } },
			{ id: 'v5', category: { en: 'Body (Sharira)', hi: 'शरीर' }, text: { en: 'My hands and feet are usually cold.', hi: 'मेरे हाथ और पैर आमतौर पर ठंडे रहते हैं।' } },
			{ id: 'v6', category: { en: 'Digestion', hi: 'पाचन' }, text: { en: 'My appetite changes frequently.', hi: 'मेरी भूख बार-बार बदलती रहती है।' } },
			{ id: 'v7', category: { en: 'Digestion', hi: 'पाचन' }, text: { en: 'I experience bloating or gas.', hi: 'मुझे पेट फूलने (bloating) या गैस की समस्या होती है।' } },
			{ id: 'v8', category: { en: 'Digestion', hi: 'पाचन' }, text: { en: 'My sleep is light or disturbed.', hi: 'मेरी नींद कच्ची है या बार-बार टूटती है।' } },
			{ id: 'v9', category: { en: 'Mind', hi: 'मन' }, text: { en: 'I learn quickly but forget easily.', hi: 'मैं जल्दी सीखता हूँ लेकिन आसानी से भूल भी जाता हूँ।' } },
			{ id: 'v10', category: { en: 'Mind', hi: 'मन' }, text: { en: 'I worry easily.', hi: 'मैं आसानी से चिंतित हो जाता हूँ।' } },
			{ id: 'v11', category: { en: 'Mind', hi: 'मन' }, text: { en: 'My mood changes quickly.', hi: 'मेरा मूड बहुत जल्दी बदलता है।' } },
			{ id: 'v12', category: { en: 'Mind', hi: 'मन' }, text: { en: 'I move or talk fast.', hi: 'मैं तेजी से चलता या बोलता हूँ।' } },
		]
	}
};

const PrakritiAssessment = () => {
	const location = useLocation();
	const [lang, setLang] = useState('en'); // 'en' for English, 'hi' for Hindi
	const [step, setStep] = useState(0);
	const [answers, setAnswers] = useState({});
	const [results, setResults] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isPrakritiFilled, setIsPrakritiFilled] = useState(false);

	const stepsKeys = ['kapha', 'pitta', 'vata'];
	const currentDoshaKey = stepsKeys[step];
	const currentDosha = DOSHA_DATA[currentDoshaKey];


	const getAuthData = () => {
		const token = localStorage.getItem("token");
		if (!token) return null;
		try {
			const decoded = jwtDecode(token);
			return { token, userId: decoded.id, email: decoded.email };
		} catch (error) {
			return null;
		}
	};

	useEffect(() => {
		if (location.state?.viewResult) {
			fetchExistingResult();
		}
	}, [location.state]);

	const fetchExistingResult = async () => {
		const auth = getAuthData();
		if (!auth) return;

		try {
			const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/prakriti/assessment/getall`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${auth.token}`
				},
				body: JSON.stringify({ patientEmail: auth.email })
			});

			if (response.ok) {
				const data = await response.json();

				// FIX: Map backend 'calculatedScores' and 'dominantDosha' to frontend 'results' state
				if (data && data.calculatedScores) {
					const percentages = data.calculatedScores;

					// Reconstruct the 'sorted' array for the bar charts
					const sorted = Object.entries(percentages)
						.sort((a, b) => b[1] - a[1]);

					setResults({
						percentages: percentages,
						prakritiType: data.dominantDosha, // Already uppercase from DB
						sorted: sorted
					});

					setStep(3); // Now this will trigger the results view correctly
				}
			}
		} catch (error) {
			console.error("Error fetching existing result:", error);
		}
	};

	const submitToBackend = async (calculatedResults) => {
		const auth = getAuthData();
		if (!auth) return alert("Please log in to save your results.");

		setIsSubmitting(true);
		try {
			const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/prakriti/assessment`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${auth.token}`
				},
				body: JSON.stringify({
					answers: answers, // your state containing {k1: 4, p1: 2...}
					results: calculatedResults
				})
			});

			if (response.ok) {
				setIsPrakritiFilled(true);
				alert("Assessment saved successfully!");
			}
		} catch (error) {
			console.error("Failed to save:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleAnswer = (questionId, value) => {
		setAnswers(prev => ({ ...prev, [questionId]: value }));
	};

	const calculateResults = () => {
		let scores = { kapha: 0, pitta: 0, vata: 0 };
		const maxScorePerDosha = 12 * 4;

		Object.keys(answers).forEach(key => {
			if (key.startsWith('k')) scores.kapha += answers[key];
			if (key.startsWith('p')) scores.pitta += answers[key];
			if (key.startsWith('v')) scores.vata += answers[key];
		});

		const percentages = {
			kapha: Math.round((scores.kapha / maxScorePerDosha) * 100),
			pitta: Math.round((scores.pitta / maxScorePerDosha) * 100),
			vata: Math.round((scores.vata / maxScorePerDosha) * 100)
		};

		const sorted = Object.entries(percentages).sort((a, b) => b[1] - a[1]);
		const [primary, secondary, tertiary] = sorted;

		let prakritiType = primary[0];

		if (primary[1] - secondary[1] <= 10) {
			prakritiType = `${primary[0]}-${secondary[0]}`;
			if (primary[1] - tertiary[1] <= 10) {
				prakritiType = 'Tridoshic (Vata-Pitta-Kapha)';
			}
		}

		const finalResults = { percentages, prakritiType: prakritiType.toUpperCase(), sorted };
		setResults(finalResults);
		setStep(3);

		submitToBackend(finalResults);
	};

	const handleNext = () => {
		window.scrollTo(0, 0);
		if (step < 2) setStep(step + 1);
		else calculateResults();
	};

	const handleBack = () => {
		window.scrollTo(0, 0);
		if (step > 0) setStep(step - 1);
	};

	const toggleLanguage = () => {
		setLang(prev => (prev === 'en' ? 'hi' : 'en'));
	};

	// Render Result Dashboard
	if (step === 3 && results) {
		return (
			<div className="pa-module-container pa-results-container">
				<h2>{UI_TEXT.resultsTitle[lang]}</h2>
				<div className="pa-primary-result">
					<h3>{results.prakritiType}</h3>
					<p>{UI_TEXT.resultsSub[lang]}</p>
				</div>

				<div className="pa-bars-container">
					{results.sorted.map(([dosha, pct]) => (
						<div key={dosha} className="pa-bar-row">
							<span className="pa-bar-label">{dosha.toUpperCase()}</span>
							<div className="pa-bar-track">
								<div
									className="pa-bar-fill"
									style={{
										width: `${pct}%`,
										backgroundColor: DOSHA_DATA[dosha].color
									}}
								>
									<span className="pa-bar-text">{pct}%</span>
								</div>
							</div>
						</div>
					))}
				</div>
				<button className="pa-btn pa-btn-primary" onClick={() => { setResults(null); setStep(0); }}>
					{UI_TEXT.btnRetake[lang]}
				</button>
			</div>
		);
	}

	return (
		<div className="pa-module-container">
			{/* Language Toggle */}
			<div className="pa-lang-toggle-wrapper">
				<button
					className={`pa-lang-btn ${lang === 'en' ? 'active' : ''}`}
					onClick={() => setLang('en')}
				>
					English
				</button>
				<button
					className={`pa-lang-btn ${lang === 'hi' ? 'active' : ''}`}
					onClick={() => setLang('hi')}
				>
					हिंदी
				</button>
			</div>

			{/* Stepper Header */}
			<div className="pa-stepper">
				{stepsKeys.map((key, index) => (
					<React.Fragment key={key}>
						<div className={`pa-step-icon ${index <= step ? 'active' : ''}`} style={{ borderColor: index <= step ? DOSHA_DATA[key].color : '#ccc' }}>
							<span style={{ color: index <= step ? DOSHA_DATA[key].color : '#999' }}>
								{DOSHA_DATA[key].title}
							</span>
						</div>
						{index < 2 && <div className={`pa-step-line ${index < step ? 'active' : ''}`}></div>}
					</React.Fragment>
				))}
			</div>

			<div className="pa-step-description" style={{ backgroundColor: currentDosha.bgColor, color: currentDosha.color }}>
				{currentDosha.description[lang]}
			</div>

			{/* Question Cards */}
			<div className="pa-questions-list">
				{currentDosha.questions.map((q) => (
					<div key={q.id} className="pa-card">
						<div className="pa-card-header">
							<span className="pa-sanskrit-tag">{q.category[lang]}</span>
							<p className="pa-question-text">{q.text[lang]}</p>
						</div>

						<div className="pa-options-group">
							{OPTIONS.map(opt => (
								<label key={`${q.id}-${opt.value}`} className="pa-radio-label">
									<input
										type="radio"
										name={`question-${q.id}`}
										value={opt.value}
										checked={answers[q.id] === opt.value}
										onChange={() => handleAnswer(q.id, opt.value)}
									/>
									<span className="pa-radio-custom" style={{
										backgroundColor: answers[q.id] === opt.value ? currentDosha.color : '#fff',
										borderColor: answers[q.id] === opt.value ? currentDosha.color : '#ccc'
									}}>
										{answers[q.id] === opt.value && <span className="pa-radio-dot"></span>}
									</span>
									<span className="pa-radio-text">{opt.label[lang]}</span>
								</label>
							))}
						</div>
					</div>
				))}
			</div>

			{/* Navigation */}
			<div className="pa-navigation">
				<button
					className="pa-btn pa-btn-secondary"
					onClick={handleBack}
					disabled={step === 0}
				>
					{UI_TEXT.btnBack[lang]}
				</button>
				<button
					className="pa-btn pa-btn-primary"
					onClick={handleNext}
					style={{ backgroundColor: currentDosha.color }}
				>
					{step === 2 ? UI_TEXT.btnSubmit[lang] : UI_TEXT.btnContinue[lang]}
				</button>
			</div>
		</div>
	);
};

export default PrakritiAssessment;