import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./TreatmentDetails.css";

const treatmentData = {
  "Digestive Health": {
    title: "Digestive Health in Ayurveda",
    description:
      "Digestion is the foundation of health in Ayurveda. A strong Agni (digestive fire) ensures proper metabolism, while imbalances can lead to Ama (toxins) and digestive disorders.",
    concerns: [
      {
        title: "Acid Reflux & Heartburn (Amla Pitta)",
        description:
          "Acid reflux occurs when stomach acid moves up into the esophagus, causing a burning sensation in the chest (heartburn). Ayurveda links this to Pitta Dosha imbalance, aggravated by spicy, oily, and acidic foods.",
        approach: [
          "Avoid hot, sour, and fermented foods. Drink cool herbal teas like fennel (Saunf) and licorice (Mulethi).",
          "Eat meals on time and avoid lying down immediately after eating.",
          "Herbs: Amla, Guduchi, Yashtimadhu (Licorice) help soothe excess acidity.",
        ],
        image: require("../media/hb.png"),
        callToAction: "Personalized Plan? Book an Ayurvedic consultation for customized dietary & herbal recommendations."
      },
      {
        title: "Constipation & Indigestion (Vibandh & Ajirna)",
        description:
          "Constipation refers to infrequent or difficult bowel movements, often caused by Vata imbalance. Indigestion (Ajirna) happens when food isn't properly broken down, leading to bloating and discomfort.",
        approach: [
          "Increase fiber-rich foods like soaked raisins, ghee, and warm fluids.",
          "Regular meal timings and Abhyanga (self-massage with warm oil) to calm Vata.",
          "Herbs: Triphala, Isabgol (Psyllium husk), and castor oil for gentle relief.",
        ],
        image: require("../media/in.jpg"),
        // "/images/constipation.jpg",
        callToAction: "Need expert advice? Consult our Ayurvedic doctor for a natural, dosha-based solution!"
      },
      {
        title: "Diarrhea & Loose Motions (Atisara)",
        description:
          "Frequent loose stools indicate an aggravated Pitta Dosha or Kapha Dosha. It can be due to infections, food intolerance, or weak digestion.",
        approach: [
          "Light, easy-to-digest foods like moong dal khichdi, buttermilk, and pomegranate juice.",
          "Rest and hydration are key. Avoid heavy, oily, and dairy-rich foods.",
          "Herbs: Bilva (Bael fruit), Kutaj (Holarrhena), and Pippali help restore gut balance.",
        ],
        image: "../images/Diarrhea & Loose Motions.jpeg",
        //"/images/diarrhea.jpg",
        callToAction: "Experiencing recurring issues? Get a personalized Ayurvedic gut-healing plan from our experts."
      },
      {
        title: "Irritable Bowel Syndrome (IBS)",
        description:
          "IBS causes alternating constipation, diarrhea, bloating, and stomach cramps. Ayurveda links this to an imbalance in Vata Dosha, often triggered by stress, irregular eating, or improper food combinations.",
        approach: [
          "Follow a Satvic (light & fresh) diet with warm, well-cooked foods.",
          "Stress management through meditation and yoga is crucial.",
          "Herbs: Ashwagandha for stress, Triphala for digestion, and Brahmi for calming the mind.",
        ],
        image:  require("../media/Irritable Bowel Syndrome.jpeg"),
        //"/images/ibs.jpg",
        callToAction: "Struggling with digestive discomfort? Get expert guidance for long-term gut health!"
      },
      {
        title: "Stomach Ulcers (Parinam Shoola)",
        description:
          "Ulcers are open sores in the stomach lining, often due to excessive Pitta Dosha, stress, or infection. They cause burning pain, nausea, and acid regurgitation.",
        approach: [
          "Cooling foods like coconut water, ghee, and soaked almonds. Avoid spicy, fried, and caffeine-based foods.",
          "Reduce stress through pranayama and maintain meal discipline.",
          "Herbs: Yashtimadhu (Licorice), Shatavari, and Aloe Vera help soothe the stomach lining.",
        ],
        image: require("../media/digestive.jpg"),
        //"/images/ulcers.jpg",
        callToAction: "Need Ayurvedic healing? Consult an Ayurvedic expert for a tailored approach."
      },
    ],
  },

  "Respiratory Health": {
    title: "Respiratory Health in Ayurveda",
    description:
      "The respiratory system is governed by Prana Vayu (life force energy) and influenced by Kapha Dosha (mucus & moisture balance) and Vata Dosha (air & movement). Imbalances in these doshas can lead to chronic respiratory conditions. Ayurveda focuses on herbal remedies, dietary modifications, and lifestyle changes to strengthen the lungs, clear toxins, and restore breath balance.",
    concerns: [
      {
        title: "Asthma & Breathing Problems (Tamaka Shwasa)",
        description:
          "Asthma is a chronic lung condition that causes difficulty in breathing due to airway inflammation and mucus buildup. Ayurveda considers it a Kapha-Vata disorder, where excess mucus blocks airflow, and Vata creates spasms in the lungs.",
        approach: [
          "Diet: Avoid cold, heavy, and dairy-based foods. Consume warm herbal drinks like ginger-turmeric tea.",
          "Lifestyle: Steam inhalation with eucalyptus oil and Pranayama (breathing exercises) for lung strength.",
          "Herbs: Vasaka (Malabar Nut), Yashtimadhu (Licorice), Tulsi (Holy Basil) help open airways.",
        ],
        image: "../images/asthma.jpg",
        callToAction: "Struggling with asthma? Book a consultation to get a customized herbal plan!"
      },
      {
        title: "Chronic Cough & Cold (Kasa & Pratishaya)",
        description:
          "Frequent coughs and colds occur due to low immunity, seasonal changes, or Kapha-Vata imbalances. Coughing can be dry (Vata) or mucus-filled (Kapha), requiring different treatments.",
        approach: [
          "Diet: Warm, easy-to-digest meals. Avoid cold drinks and excess sweets.",
          "Lifestyle: Keep the body warm, do oil massage (Abhyanga) to balance Vata.",
          "Herbs: Sitopaladi Churna, Mulethi (Licorice), and Pippali (Long Pepper) help relieve congestion.",
        ],
        image:"../images/cough.jpg",
        // "/images/cough.jpg",
        callToAction: "Chronic cough troubling you? Get an expert Ayurvedic consultation for lasting relief!"
      },
      {
        title: "Sinusitis & Nasal Congestion (Peenas)",
        description:
          "Sinusitis is caused by Kapha imbalance, where mucus gets trapped in the sinuses, leading to headaches, congestion, and difficulty breathing.",
        approach: [
          "Diet: Avoid heavy, oily, and dairy-rich foods. Drink warm herbal teas with Tulsi & Ginger.",
          "Lifestyle: Neti Kriya (nasal cleansing with saline water) and steam inhalation help clear sinuses.",
          "Herbs: Trikatu (Ginger, Black Pepper, Pippali), Neem, and Dashmool work effectively.",
        ],
        image: "../images/sinu.jpg",
        callToAction: "Suffering from blocked sinuses? Consult an Ayurvedic expert for relief!"
      },
      {
        title: "Bronchitis & Chest Infections (Kasa Roga)",
        description:
          "Bronchitis occurs when the bronchial tubes in the lungs become inflamed, leading to persistent cough, phlegm, and breathing difficulties. It is caused by Kapha accumulation, cold exposure, or viral infections.",
        approach: [
          "Diet: Warm, light meals like moong dal soup and herbal tonics. Avoid fried foods and cold beverages.",
          "Lifestyle: Steam inhalation, chest massage with warm mustard oil, and gargling with turmeric water.",
          "Herbs: Vasaka, Tulsi, and Licorice help soothe the airways.",
        ],
        image: "../images/chestpain.jpg",
        // "/images/bronchitis.jpg",
        callToAction: "Need long-term lung care? Get a personalized Ayurvedic treatment plan!"
      }
    ],
  },

  "Skin Care": {
    title: "Skin & Hair Care in Ayurveda",
    description:
      "Skin and hair reflect the balance of Pitta (heat), Kapha (moisture), and Vata (dryness) doshas. Imbalances can lead to conditions like acne, eczema, hair fall, and premature greying. Ayurveda treats these concerns holistically with diet, lifestyle changes, herbal formulations, and detox therapies for long-term healing rather than just temporary relief.",
    concerns: [
      {
        title: "Acne & Pimples (Yauvan Pidika)",
        description:
          "Acne occurs due to excessive Pitta dosha, which increases heat in the blood (Rakta dhatu) and leads to inflammation, pimples, and breakouts. Excessive oily foods, stress, and hormonal imbalance can worsen acne.",
        approach: [
          "Diet: Avoid spicy, fried, and dairy-rich foods. Eat cooling foods like cucumber, coconut water, and fresh fruits.",
          "Lifestyle: Wash face with rose water, apply sandalwood & turmeric paste for cooling.",
          "Herbs: Neem, Manjistha, and Aloe Vera help purify blood and clear acne.",
        ],
        image:  "../images/skinacne.jpg",
        //"/images/acne.jpg",
        callToAction: "Struggling with breakouts? Get a personalized Ayurvedic skincare plan!"
      },
      {
        title: "Eczema & Dry Skin Issues (Vicharchika)",
        description:
          "Eczema is caused by Vata-Pitta imbalance, leading to dry, itchy, inflamed skin. Ayurvedic texts suggest it is a blood & liver disorder, which needs internal and external detoxification.",
        approach: [
          "Diet: Hydrating foods like ghee, coconut, and herbal teas; avoid excessive caffeine and processed foods.",
          "Lifestyle: Oil massage (Abhyanga) with coconut or almond oil before bathing. Use Aloe Vera gel for soothing skin.",
          "Herbs: Neem, Guduchi, and Triphala help detox the liver and reduce inflammation.",
        ],
        image: "../images/Eczema & Dry Skin Issues.jpeg",
        //"/images/eczema.jpg",
        callToAction: "Dealing with chronic eczema? Consult an Ayurvedic expert for deep healing!"
      },
      {
        title: "Psoriasis & Skin Rashes (Kitibha)",
        description:
          "Psoriasis is a chronic autoimmune skin disorder caused by Vata-Kapha imbalance, leading to dry, scaly, and itchy patches. Stress, poor digestion, and toxins aggravate the condition.",
        approach: [
          "Diet: Follow a light detoxifying diet with bitter vegetables like bitter gourd, neem leaves, and turmeric milk. Avoid processed and non-vegetarian food.",
          "Lifestyle: Apply Aloe Vera & Turmeric paste, take oil baths with medicated sesame oil.",
          "Herbs: Triphala, Manjistha, and Bakuchi help cleanse the skin and blood.",
        ],
        image: "../images/psoriasis.jpg",
        callToAction: "Need holistic care for psoriasis? Book a consultation for Ayurvedic guidance!"
      },
      {
        title: "Dandruff & Hair Fall (Darunaka & Khalitya)",
        description:
          "Dandruff is caused by an imbalanced Kapha (excess oil) and Vata (dry scalp), leading to flakes, itching, and hair fall. Excess stress, pollution, and poor diet weaken hair roots.",
        approach: [
          "Diet: Include iron-rich foods like spinach, almonds, and sesame seeds. Reduce junk and sugary foods.",
          "Lifestyle: Use Bhringraj & Amla oil for scalp massage, and wash hair with herbal powders like Shikakai & Reetha.",
          "Herbs: Bhringraj, Brahmi, and Fenugreek strengthen hair roots and prevent fall.",
        ],
        image: "../images/Dandruff.jpg",
        callToAction: "Facing severe hair loss? Get a custom Ayurvedic hair care routine!"
      },
      {
        title: "Premature Greying of Hair (Palitya)",
        description:
          "Greying before age 30 is due to excessive Pitta, stress, and nutritional deficiencies. Ayurveda focuses on nourishing hair from within rather than chemical treatments.",
        approach: [
          "Diet: Eat Amla, curry leaves, black sesame seeds, and almonds. Avoid excess caffeine and fried food.",
          "Lifestyle: Massage scalp with Bhringraj & coconut oil for melanin restoration. Reduce stress with meditation & yoga.",
          "Herbs: Amla, Brahmi, and Ashwagandha boost hair pigmentation.",
        ],
        image: "../images/Premature Greying of Hair.jpeg",
        callToAction: "Want to restore natural hair color? Consult our Ayurvedic specialists today!"
      }
    ],
  },

  "Joint and Bone Health": {
    title: "Joint & Bone Health in Ayurveda",
    description:
      "Ayurveda considers joint and bone health as a balance of Vata (movement), Pitta (metabolism), and Kapha (lubrication). With aging, Vata increases, causing stiffness, pain, and degeneration. Poor digestion, toxin accumulation (Ama), and weak bones (Asthi Dhatu Kshaya) contribute to conditions like arthritis, back pain, and osteoporosis. Ayurvedic treatments focus on deep nourishment, detoxification, and strengthening bones & joints naturally.",
    concerns: [
      {
        title: "Arthritis & Joint Pain (Sandhivata & Amavata)",
        description:
          "Arthritis is caused by Vata imbalance, leading to pain, stiffness, swelling, and reduced mobility. If toxins (Ama) accumulate in joints, it worsens inflammation.",
        approach: [
          "Diet: Eat warm, nourishing foods like soups, ghee, and anti-inflammatory spices (turmeric, ginger). Avoid cold & processed foods.",
          "Lifestyle: Daily oil massage (Abhyanga) with Mahanarayan oil reduces pain and stiffness. Regular gentle yoga & stretching improve flexibility.",
          "Herbs: Ashwagandha, Guggulu, and Shallaki (Boswellia) reduce inflammation & strengthen joints.",
        ],
        image: "../images/jointpain.jpg",
        //"/images/arthritis.jpg",
        callToAction: "Struggling with joint pain? Get a customized Ayurvedic arthritis plan!"
      },
      {
        title: "Back Pain & Sciatica (Kateegraham & Gridhrasi)",
        description:
          "Back pain and sciatica are caused by excess Vata, leading to nerve compression, muscle stiffness, and pain radiating to legs. Long sitting hours, poor posture, and weak digestion aggravate it.",
        approach: [
          "Diet: Include calcium-rich foods (sesame seeds, ragi, dairy). Avoid junk food and excessive caffeine.",
          "Lifestyle: Warm oil massages with Dhanwantharam oil, gentle stretching, and Panchakarma therapy (Kati Basti) for nerve healing.",
          "Herbs: Dashmool, Ashwagandha, and Shatavari help strengthen nerves and reduce stiffness.",
        ],
        image: "../images/backpain.jpg",
        callToAction: "Need relief from chronic back pain? Book an Ayurvedic consultation today!"
      },
      {
        title: "Osteoporosis (Asthi Kshaya - Weak Bones)",
        description:
          "Osteoporosis happens due to Vata & Pitta imbalance, leading to bone loss, brittleness, and fractures. Low calcium, improper digestion, and aging speed up bone depletion.",
        approach: [
          "Diet: Increase calcium & mineral intake (ragi, sesame, figs, dates, dairy). Avoid processed & acidic foods.",
          "Lifestyle: Oil massage (Abhyanga) with sesame oil, regular mild weight-bearing exercises like yoga.",
          "Herbs: Hadjod (Cissus quadrangularis), Arjuna, and Ashwagandha boost bone density & strength.",
        ],
        image: "../images/Osteoporosis.jpg",
        callToAction: "Worried about weak bones? Get expert Ayurvedic guidance for bone health!"
      },
      {
        title: "Rheumatism & Muscle Stiffness (Vata-Rakta)",
        description:
          "Rheumatism is linked to Ama (toxins) accumulation & aggravated Vata, causing stiffness, muscle pain, and fatigue. Cold weather and poor digestion worsen symptoms.",
        approach: [
          "Diet: Eat warming, easily digestible foods (soups, ghee, turmeric milk). Avoid cold, stale, and heavy foods.",
          "Lifestyle: Steam therapy (Swedana), warm oil massages, and light exercise improve circulation.",
          "Herbs: Guggulu, Rasna, and Guduchi cleanse toxins and support joint flexibility.",
        ],
        image: "../images/Rheumatism.jpg",
        callToAction: "Suffering from chronic stiffness? Start an Ayurvedic detox today!"
      }
    ],
  },

  "Cardiovascular Health": {
    title: "Ayurvedic Approach to Heart & Blood Circulation Health",
    description:
      "In Ayurveda, heart health is linked to the balance of Rasa Dhatu (plasma), Rakta Dhatu (blood), and Ojas (vital energy). Imbalances in Vata (circulatory movement), Pitta (metabolism), and Kapha (cholesterol buildup) lead to heart issues like high blood pressure, cholesterol, and poor circulation. Ayurvedic treatments focus on detoxifying the blood, strengthening the heart, and improving circulation naturally.",
    concerns: [
      {
        title: "High Blood Pressure (Hypertension - Rakta Gata Vata)",
        description:
          "Hypertension occurs when Vata imbalance increases pressure in blood vessels, often due to stress, poor diet, sedentary lifestyle, and toxin buildup (Ama). If left unchecked, it can lead to heart disease and strokes.",
        approach: [
          "Diet: Consume cooling & hydrating foods (coconut water, pomegranate, beetroot, and coriander water). Avoid salty, fried, and spicy foods.",
          "Lifestyle: Practice deep breathing (Pranayama), meditation, and daily walks to calm the mind.",
          "Herbs: Arjuna, Brahmi, and Jatamansi reduce stress and regulate blood pressure naturally.",
        ],
        image: "../images/bloodpressure.jpg",
        //"/images/hypertension.jpg"
        callToAction: "Struggling with high BP? Get a natural Ayurvedic heart health plan!"
      },
      {
        title: "High Cholesterol & Blocked Arteries (Medo Roga & Dhamani Pratichaya)",
        description:
          "Excess Kapha (fat accumulation) leads to plaque buildup in arteries, slowing circulation and increasing the risk of heart attacks. Poor digestion and weak Agni (metabolic fire) contribute to cholesterol imbalance.",
        approach: [
          "Diet: Increase fiber-rich, light foods (moong dal, leafy greens, garlic, ginger). Avoid fried foods, excessive dairy, and heavy meats.",
          "Lifestyle: Regular exercise, yoga, and detoxification therapies (Panchakarma) help clear arteries.",
          "Herbs: Triphala, Guggulu, and Arjuna help dissolve plaque and regulate lipid metabolism.",
        ],
        image: "../images/cholesterol.jpg",
        callToAction: "Concerned about cholesterol? Try a heart-cleansing Ayurvedic program!"
      },
      {
        title: "Poor Blood Circulation (Rakta Dushti & Vyana Vayu Imbalance)",
        description:
          "Poor circulation is caused by weak Vyana Vayu (circulatory energy), toxin buildup, and sluggish blood flow, leading to cold hands & feet, varicose veins, fatigue, and numbness.",
        approach: [
          "Diet: Eat warm, circulation-boosting foods (ginger tea, black pepper, cinnamon, and nuts). Avoid cold & heavy foods.",
          "Lifestyle: Daily self-massage (Abhyanga) with warm sesame or mustard oil stimulates circulation.",
          "Herbs: Ashwagandha, Guggulu, and Manjistha strengthen blood flow and purify the blood.",
        ],
        image: "../images/Poor Blood Circulation.jpg",
        callToAction: "Feeling tired or sluggish? Improve circulation with an Ayurvedic plan!"
      }
    ],
  },

  "Mental Health and Wellness": {
    title: "Ayurvedic Approach to Stress, Anxiety & Mental Wellness",
    description:
      "In Ayurveda, mental health is governed by Sattva (clarity), Rajas (agitation), and Tamas (dullness) and is deeply connected to the balance of Vata, Pitta, and Kapha doshas. Mental disorders arise due to excess Vata (restlessness), aggravated Pitta (anger, frustration), or excessive Kapha (lethargy, depression). Ayurveda focuses on calming the mind, nourishing the nervous system, and promoting emotional balance.",
    concerns: [
      {
        title: "Anxiety & Depression (Chittodvega & Vishada Roga)",
        description:
          "Anxiety (Chittodvega) is caused by excessive Vata, leading to overthinking, nervousness, and restlessness. Depression (Vishada) occurs due to an imbalance in Kapha (heaviness, lack of motivation) and Pitta (self-criticism, burnout).",
        approach: [
          "Diet: Eat grounding and nourishing foods (warm milk with nutmeg, almonds, dates, ghee). Avoid caffeine, refined sugar, and processed foods.",
          "Lifestyle: Daily oil massage (Abhyanga) with sesame oil, yoga, and meditation calm the nervous system.",
          "Herbs: Brahmi, Ashwagandha, and Shankhpushpi help relieve anxiety and uplift mood.",
        ],
        image: "../images/anxiety.jpg",
        callToAction: "Feeling anxious or low? Try an Ayurvedic mind-calming therapy!"
      },
      {
        title: "Insomnia & Sleep Disorders (Nidranasha)",
        description:
          "Insomnia is caused by excessive Vata (overactive mind), aggravated Pitta (racing thoughts at night), or Kapha imbalance (disturbed sleep cycles). It leads to fatigue, irritability, and poor focus.",
        approach: [
          "Diet: Warm turmeric milk, chamomile tea, and dates before bedtime. Avoid heavy meals, caffeine, and spicy foods at night.",
          "Lifestyle: Follow a fixed sleep schedule, use calming essential oils (lavender, sandalwood), and practice Shirodhara (forehead oil therapy).",
          "Herbs: Tagara (Indian valerian), Brahmi, and Jatamansi promote deep and restful sleep.",
        ],
        image: "../images/insomniaS.jpg",
        callToAction: "Struggling with sleep? Try Ayurveda's natural sleep therapy!"
      },
      {
        title: "Stress Management (Manasik Santulan)",
        description:
          "Stress occurs when Vata-Pitta energy is imbalanced, leading to mental burnout, fatigue, irritability, and weakened immunity. Chronic stress can cause lifestyle disorders like high blood pressure, digestive issues, and insomnia.",
        approach: [
          "Diet: Eat cooling and nourishing foods (coconut water, ghee, fresh fruits). Avoid spicy, fried, and acidic foods.",
          "Lifestyle: Practice daily breathing exercises (Pranayama), Yoga Nidra, and Abhyanga (self-massage) for relaxation.",
          "Herbs: Ashwagandha, Tulsi, and Gotu Kola reduce stress and promote emotional balance.",
        ],
        image: "../images/Stress.jpg",
        callToAction: "Feeling overwhelmed? Start Ayurvedic stress relief today!"
      },
      {
        title: "Memory & Concentration Improvement (Medhya Rasayana Therapy)",
        description:
          "Weak memory, lack of focus, and brain fog are caused by Vata imbalance (poor nervous coordination), weak Agni (low digestive fire affecting nutrient absorption), and toxin buildup in the brain.",
        approach: [
          "Diet: Eat brain-boosting foods (walnuts, soaked almonds, Brahmi tea, ghee, dates). Avoid junk food, carbonated drinks, and excessive sugar.",
          "Lifestyle: Practice Trataka (candle gazing), meditation, and Brahmi oil head massage for mental clarity.",
          "Herbs: Brahmi, Shankhpushpi, and Jyotishmati improve cognitive function and enhance memory.",
        ],
        image: "../images/Memory  Improvement.jpg",
        callToAction: "Want sharper focus & better memory? Boost your brain naturally with Ayurveda!"
      }
    ],
  },

  "Metabolic and Endocrine Health": {
    title: "Ayurvedic Approach to Metabolism & Hormonal Health",
    description: "In Ayurveda, metabolism and hormonal balance are controlled by Agni (digestive fire), Ojas (vital energy), and the balance of Vata, Pitta, and Kapha doshas. Metabolic disorders arise due to weak digestion, toxin accumulation (Ama), stress, and an imbalance in the body's natural rhythms. Ayurvedic treatments focus on balancing Agni, detoxifying the body, and using herbs & lifestyle changes to regulate hormones naturally.",
    concerns: [
      {
        title: "Diabetes & Blood Sugar Control (Madhumeha)",
        description: "Diabetes (Madhumeha) is linked to an imbalance in Kapha and Vata doshas, leading to weakened digestion, poor insulin regulation, and excess sugar in the blood. Ayurveda views diabetes as a lifestyle disorder caused by improper diet, stress, and lack of physical activity.",
        approach: [
          "Diet: Eat low-glycemic foods (bitter gourd, fenugreek seeds, amla, turmeric). Avoid processed sugar, white flour, and excess carbohydrates.",
          "Lifestyle: Daily morning walks, yoga (especially Surya Namaskar), and stress management help regulate blood sugar.",
          "Herbs: Gudmar (Sugar Destroyer), Vijaysar, and Jamun help control blood sugar levels naturally."
        ],
        image: require("../media/diabeties.jpg"),
        callToAction: "Struggling with diabetes? Try Ayurveda's natural sugar-balancing therapy!"
      },
      {
        title: "Thyroid Disorders (Galaganda & Gandamala)",
        description: "Thyroid disorders occur due to imbalance in Kapha (hypothyroidism - weight gain, lethargy) or Pitta (hyperthyroidism - weight loss, restlessness). Poor metabolism, stress, and iodine deficiency contribute to thyroid issues.",
        approach: [
          "Diet: Eat iodine-rich foods (seaweed, pink Himalayan salt) and metabolism-boosting spices (cumin, coriander, black pepper). Avoid processed foods and excessive dairy.",
          "Lifestyle: Perform Ujjayi Pranayama (breathwork), and maintain a regular sleep cycle.",
          "Herbs: Ashwagandha, Guggulu, and Kanchanar Guggulu help regulate thyroid function naturally."
        ],
        image: "../images/thyroidperson.jpg",
        callToAction: "Thyroid imbalance? Get Ayurvedic solutions for hormonal balance!"
      },
      {
        title: "Weight Loss & Metabolism Boost (Sthoulya Chikitsa)",
        description: "Weight gain occurs due to slow Agni (digestive fire), excess Kapha (heaviness, sluggishness), and toxin accumulation (Ama). A poor diet, stress, and lack of movement worsen metabolism.",
        approach: [
          "Diet: Eat warm, light meals (moong dal, green vegetables, buttermilk) and avoid fried, sugary, and heavy foods.",
          "Lifestyle: Daily self-massage (Udwarthanam) with herbal powders, morning yoga, and intermittent fasting (Ayurvedic Upavasa) enhance metabolism.",
          "Herbs: Triphala, Guggulu, and Punarnava help in natural weight loss and detoxification."
        ],
        image: "../images/Weight loss.jpg",
        callToAction: "Want to shed extra weight? Try Ayurvedic weight management therapy!"
      },
      {
        title: "PCOS/PCOD & Menstrual Issues (Stree Roga)",
        description: "Polycystic Ovary Syndrome (PCOS) and irregular periods occur due to excess Kapha (hormonal imbalance, cyst formation), aggravated Vata (irregular cycles), and high Pitta (inflammation, acne, mood swings). Ayurveda treats PCOS by balancing hormones, improving digestion, and reducing stress.",
        approach: [
          "Diet: Eat fiber-rich foods (flaxseeds, whole grains, soaked almonds) and hormone-balancing spices (cinnamon, turmeric, fennel). Avoid junk food, dairy, and excess caffeine.",
          "Lifestyle: Regular exercise, yoga (Baddha Konasana, Malasana), and meditation help regulate periods.",
          "Herbs: Shatavari, Ashoka, and Lodhra restore hormonal balance and support reproductive health."
        ],
        image: "../images/period pain.jpg",
        callToAction: "Struggling with PCOS? Get natural Ayurvedic support for your cycle!"
      }
    ]
  },
  "Immune Support": {
    title: "Ayurvedic Approach to Immune System Support",
    description: "In Ayurveda, Vyadhikshamatva (immunity) is the body's natural defense system governed by Ojas (vital energy), Agni (digestive fire), and a balance of Vata, Pitta, and Kapha doshas. A strong immune system prevents infections, allergies, and chronic diseases. Ayurvedic immunity-boosting focuses on herbs, detoxification, balanced nutrition, and lifestyle practices.",
    concerns: [
      {
        title: "General Immunity Boosting (Vyadhikshamatva Vardhana)",
        description: "A weak immune system results from poor digestion (low Agni), toxin buildup (Ama), and an imbalance in Ojas. Frequent illnesses, low energy, and slow recovery indicate poor immunity.",
        approach: [
          "Diet: Eat warm, nourishing foods (ghee, turmeric milk, seasonal fruits) and avoid junk food, excess sugar, and cold drinks.",
          "Lifestyle: Daily morning sunlight exposure, yoga (Surya Namaskar), and meditation enhance Ojas.",
          "Herbs: Chyawanprash, Ashwagandha, and Giloy (Amrita) naturally boost immunity."
        ],
        image: "../images/Immunity Boosting.jpg",
        callToAction: "Want to strengthen your immunity? Try Ayurveda's Ojas-enhancing therapy!"
      },
      {
        title: "Frequent Allergies & Sinus Issues (Pratisyaya & Nasaroga)",
        description: "Allergies and sinus problems occur due to Kapha imbalance (excess mucus), aggravated Vata (dryness, sneezing), and weak Agni. Dust, pollen, food intolerance, and seasonal changes worsen allergies.",
        approach: [
          "Diet: Eat warm, light foods (ginger tea, soups) and avoid cold, dairy, and fried foods.",
          "Lifestyle: Daily nasal cleansing (Neti Kriya) and steam inhalation with eucalyptus oil reduce sinus congestion.",
          "Herbs: Turmeric, Tulsi (Holy Basil), and Mulethi (Licorice) provide natural allergy relief."
        ],
        image: "../images/Frequent Allergies & Sinus Issues.jpg",
        callToAction: "Struggling with allergies? Get Ayurvedic remedies for long-term relief!"
      },
      {
        title: "Autoimmune Conditions (Ama-Related Disorders)",
        description: "Autoimmune diseases occur when the immune system mistakenly attacks the body's cells due to toxin buildup (Ama), aggravated Pitta (inflammation), and weak Agni. Ayurveda focuses on detoxifying the body and restoring immune balance.",
        approach: [
          "Diet: Eat anti-inflammatory foods (turmeric, ginger, green leafy vegetables) and avoid processed foods, excessive dairy, and nightshades.",
          "Lifestyle: Panchakarma detox, stress management, and regular Pranayama (breathwork) support immune balance.",
          "Herbs: Guduchi (Giloy), Ashwagandha, and Amla help regulate immunity naturally."
        ],
        image: "../images/autoimmuneS.jpg",
        callToAction: "Managing an autoimmune condition? Ayurveda provides holistic, side-effect-free solutions!"
      }
    ]
  },
  "Women's Health": {
    title: "Ayurvedic Approach to Women's Health",
    description: "In Ayurveda, women's health is deeply connected to Rasa Dhatu (nutrition), Shukra Dhatu (reproductive tissues), and the balance of Vata, Pitta, and Kapha doshas. Women go through various hormonal transitions, including menstruation, pregnancy, and menopause, which need holistic care. Ayurveda offers herbs, diet, and lifestyle practices to naturally balance hormones, support reproductive health, and enhance overall well-being.",
    concerns: [
      {
        title: "Menstrual Pain & Irregular Periods (Kashtartava & Anartava)",
        description: "Painful or irregular periods result from imbalanced Vata (causing cramps), Pitta (excess heat leading to heavy flow), or Kapha (blockages causing delayed periods). Stress, poor diet, and a sedentary lifestyle can worsen symptoms.",
        approach: [
          "Diet: Eat warm, cooked foods (moong dal, sesame seeds, jaggery) and avoid spicy, processed, and cold foods.",
          "Lifestyle: Gentle yoga (Supta Baddha Konasana), Abhyanga (oil massage), and warm compresses ease cramps.",
          "Herbs: Ashoka, Shatavari, and Ajwain (Carom seeds) help regulate cycles and reduce pain."
        ],
        image: "../images/irpain.jpg",
        callToAction: "Experiencing period issues? Try Ayurveda's natural hormone-balancing therapy!"
      },
      {
        title: "Menopause & Hormonal Changes (Rajonivritti)",
        description: "Menopause is a natural transition marked by hot flashes, mood swings, insomnia, and bone loss. Ayurveda views it as a shift from Pitta dominance to Vata dominance, requiring nourishment and hormonal balance.",
        approach: [
          "Diet: Increase healthy fats (ghee, almonds, flaxseeds) and avoid caffeine, alcohol, and processed sugar.",
          "Lifestyle: Daily self-massage (warm sesame oil), meditation, and gentle stretching help ease symptoms.",
          "Herbs: Shatavari, Brahmi, and Licorice naturally support hormonal balance."
        ],
        image: "../images/hrchanges.jpg",
        callToAction: "Going through menopause? Get personalized Ayurvedic remedies for smoother transitions!"
      },
      {
        title: "Fertility Support & Pregnancy Care (Garbhasthapana & Garbhini Paricharya)",
        description: "Ayurveda focuses on preparing the body for conception (Sutika Paricharya) and ensuring a healthy pregnancy. Infertility can arise due to weak Agni (digestion), stress, toxin accumulation (Ama), and dosha imbalances.",
        approach: [
          "Diet: Eat fertility-enhancing foods (milk, saffron, almonds, dates) and avoid junk food and excessive stress.",
          "Lifestyle: Preconception Panchakarma detox, daily yoga (Butterfly Pose), and deep breathing improve fertility.",
          "Herbs: Shatavari, Ashwagandha, and Guduchi nourish reproductive tissues and support pregnancy."
        ],
        image: "../images/Fertility.jpg",
        callToAction: "Planning for a baby? Ayurveda offers a natural path to fertility and pregnancy wellness!"
      },
      {
        title: "Vaginal Health & Infections (Yoniroga)",
        description: "Recurring vaginal infections, dryness, and discomfort arise due to poor hygiene, excess Pitta (heat), and imbalanced vaginal flora. Ayurveda focuses on restoring natural balance and preventing infections.",
        approach: [
          "Diet: Eat cooling foods (coconut water, aloe vera, yogurt) and avoid spicy, fried, and sugary foods.",
          "Lifestyle: Maintain intimate hygiene, practice Yoni Prakshalana (herbal washes), and wear breathable cotton clothing.",
          "Herbs: Neem, Triphala, and Lodhra help cleanse and maintain vaginal health."
        ],
        image: "../images/vinfection.jpg",
        callToAction: "Dealing with vaginal discomfort? Ayurveda provides gentle, effective care!"
      }
    ]
  },
  "Men's Health": {
    title: "Ayurvedic Approach to Men's Health",
    description: "Ayurveda views men's health as a balance of Agni (digestive fire), Ojas (vital energy), and the three doshas (Vata, Pitta, Kapha). Factors like stress, poor diet, hormonal imbalances, and lifestyle habits affect sexual wellness, prostate health, and hair strength. Ayurvedic herbs, therapies, and diet modifications can naturally restore vitality and promote long-term well-being.",
    concerns: [
      {
        title: "Sexual Health & Stamina Boosting (Shukra Dhatu Vriddhi)",
        description: "Low stamina, reduced libido, and sexual health concerns arise due to weakened Shukra Dhatu (reproductive tissues), stress, and poor blood circulation. Ayurveda focuses on strengthening Ojas (vital energy) and Shukra (semen quality).",
        approach: [
          "Diet: Increase nuts, dairy, dates, saffron, and ghee while avoiding alcohol, smoking, and junk food.",
          "Lifestyle: Regular exercise, yoga (Kegel exercises, Ashwini Mudra), and adequate sleep improve sexual stamina.",
          "Herbs: Ashwagandha, Shilajit, Safed Musli, and Kaunch Beej enhance vigor and testosterone levels."
        ],
        image: "../images/staminaBoostings.jpg",
        callToAction: "Struggling with energy and stamina? Ayurveda offers natural performance enhancement!"
      },
      {
        title: "Prostate Health (Vasti Roga & Mutravaha Srotas Shuddhi)",
        description: "Prostate issues like BPH (Benign Prostatic Hyperplasia), frequent urination, and inflammation result from Kapha imbalance and toxin buildup. Ayurveda focuses on urinary health, inflammation reduction, and hormone balance.",
        approach: [
          "Diet: Eat pumpkin seeds, barley, pomegranate, and flaxseeds while avoiding processed foods and excess salt.",
          "Lifestyle: Avoid holding urine for long, practice deep squats, and stay hydrated.",
          "Herbs: Gokshura, Punarnava, Varuna, and Shatavari support prostate health and improve urine flow."
        ],
        image: "../images/Prostate Health 1.jpg",
        callToAction: "Facing prostate concerns? Ayurveda ensures long-term relief with natural solutions!"
      },
      {
        title: "Hair Loss & Baldness (Khalitya & Palitya)",
        description: "Hair fall, thinning, and baldness are linked to Pitta imbalance, high stress, nutritional deficiencies, and poor scalp health. Ayurveda aims to cool the body, strengthen hair roots, and improve blood circulation to the scalp.",
        approach: [
          "Diet: Include amla, curry leaves, sesame seeds, and coconut water while avoiding spicy, fried, and excessive salty foods.",
          "Lifestyle: Scalp massage (Shiro Abhyanga) with Bhringraj oil, stress reduction, and adequate hydration help reduce hair fall.",
          "Herbs: Bhringraj, Brahmi, Amla, and Fenugreek nourish hair follicles and prevent premature greying."
        ],
        image: "../images/Hairlos.jpg",
        callToAction: "Struggling with hair loss? Ayurveda helps restore hair strength and volume naturally!"
      }
    ]
  },
  "Liver and Kidney Health": {
    title: "Ayurvedic Approach to Kidney & Liver Health",
    description: "Ayurveda views Kidneys (Vrikka) and Liver (Yakrit) as vital detoxifying organs, responsible for blood purification, metabolic balance, and toxin elimination. Any imbalance in the doshas, especially Pitta (heat & metabolism), Kapha (mucus & fat), and Vata (dryness & filtration), can lead to issues like kidney stones, liver infections, or toxin buildup. Ayurveda offers natural herbs, Panchakarma therapies, and dietary guidelines to restore organ function and prevent long-term damage.",
    concerns: [
      {
        title: "Kidney Stones & Urinary Issues (Vrikka Ashmari & Mutravaha Srotas Vikara)",
        description: "Kidney stones form due to high uric acid levels, dehydration, and excess calcium oxalate deposits. Ayurveda focuses on breaking stones naturally, improving urine flow, and reducing pain & inflammation.",
        approach: [
          "Diet: Drink plenty of barley water, coconut water, and lemon juice while avoiding oxalate-rich foods like spinach, tomatoes, and excess dairy.",
          "Lifestyle: Stay hydrated, avoid holding urine for long, and practice mild yoga stretches.",
          "Herbs: Gokshura (Tribulus terrestris) Improves urinary flow and dissolves stones, Varuna (Crataeva nurvala) - Prevents stone formation and relieves pain, Punarnava (Boerhavia diffusa) - Natural diuretic that flushes toxins."
        ],
        image: "../images/kidneystone.jpg",
        callToAction: "Suffering from kidney stones? Ayurveda provides safe, natural stone removal therapies! Consult an Ayurvedic expert today."
      },
      {
        title: "Liver Detox & Fatty Liver Treatment (Yakrit Shodhana & Medoroga Chikitsa)",
        description: "A sluggish liver, fatty liver, or toxin overload can result from poor digestion, excessive alcohol, high-fat diets, and stress. Ayurveda aims to restore liver function, promote bile flow, and eliminate toxins naturally.",
        approach: [
          "Diet: Eat bitter greens (karela, methi), turmeric, beetroot, and papaya while avoiding fried foods, alcohol, and excess sugar.",
          "Lifestyle: Practice morning detox drinks (warm water with lemon & turmeric), engage in light exercises like Surya Namaskar to stimulate digestion.",
          "Herbs: Bhumyamalaki (Phyllanthus niruri) Best for liver detox and hepatitis, Kutki (Picrorhiza kurroa) - Enhances bile production and detoxifies the liver, Amla (Indian Gooseberry) - Restores liver strength and removes toxins."
        ],
        image: "../images/Fatty Liver Treatment.png",
        callToAction: "Want a healthier liver? Ayurveda offers gentle but powerful detox solutions! Start your liver cleansing journey today."
      },
      {
        title: "Hepatitis & Liver Infections (Yakrit Vikara & Pitta Shaman Chikitsa)",
        description: "Hepatitis is an inflammation of the liver caused by viruses (Hepatitis A, B, C), poor digestion, and toxin accumulation. Ayurveda focuses on boosting immunity, reducing liver inflammation, and cleansing blood impurities.",
        approach: [
          "Diet: Avoid heavy meats, alcohol, and processed foods. Consume turmeric milk, neem juice, and fresh fruits like pomegranate & apples.",
          "Lifestyle: Oil pulling with coconut oil helps eliminate toxins from the system, while Pranayama (deep breathing) & meditation reduce stress, which can aggravate liver disorders.",
          "Herbs: Kalmegh (Andrographis paniculata) A powerful antiviral & liver tonic, Guduchi (Tinospora cordifolia) - Boosts immunity and fights infections, Neem (Azadirachta indica) - Purifies blood and reduces liver inflammation."
        ],
        image: "../images/Liver Infections.jpeg",
        callToAction: "Struggling with hepatitis or liver infection? Ayurveda provides a holistic healing approach! Take the first step towards natural recovery."
      }
    ]
  },
  "Eye Health": {
    title: "Ayurvedic Approach to Eye & Vision Health",
    description: "In Ayurveda, the eyes (Netra) are governed by Pitta dosha, especially Alochaka Pitta, which controls vision. Imbalances in Pitta, along with Vata (dryness) and Kapha (mucus accumulation), can lead to eye strain, poor vision, infections, and night blindness. Ayurveda focuses on cooling the eyes, improving circulation, and strengthening the optic nerves through diet, lifestyle, and herbal remedies.",
    concerns: [
      {
        title: "Dry Eyes & Eye Strain (Shushka Netra & Drishti Kshaya)",
        description: "Excessive screen time, pollution, and poor hydration can cause burning, redness, and dryness in the eyes. Ayurveda aims to lubricate the eyes, relax strained muscles, and restore moisture balance.",
        approach: [
          "Diet: Eat ghee, almonds, carrots, and leafy greens to nourish eye tissues. Avoid excess spicy, fried, and processed foods that increase Pitta.",
          "Lifestyle: Follow the 20-20-20 Rule (Every 20 minutes, look 20 feet away for 20 seconds). Blink often to naturally lubricate the eyes. Wash eyes with rose water or apply cotton pads soaked in Triphala water.",
          "Herbs & Remedies: Netra Tarpana (Ghee Eye Therapy) strengthens and nourishes dry eyes. Triphala Ghrita (Herbal Ghee) improves eye moisture & reduces strain. Anu Tailam (Herbal Nasal Drops) lubricates the eyes through nasal therapy."
        ],
        image: "../images/dry eye.jpg",
        callToAction: "Tired of dry, strained eyes? Ayurveda restores natural eye hydration!"
      },
      {
        title: "Weak Vision & Night Blindness (Drishti Mandya & Nyctalopia)",
        description: "Weak vision results from deficiency in eye-nourishing nutrients, aging, and excess heat in the body. Night blindness is often caused by Vitamin A deficiency and poor retinal function. Ayurveda focuses on strengthening optic nerves and enhancing clarity of vision.",
        approach: [
          "Diet: Eat Amla (Indian gooseberry), carrot juice, walnuts, and cow’s ghee to boost eye health. Avoid excess salt, caffeine, and processed foods, which worsen vision problems.",
          "Lifestyle: Practice the palming technique—rub hands together and place over closed eyes for relaxation. Sun gazing (Surya Trataka) helps strengthen vision by gently looking at the rising sun for a few seconds.",
          "Herbs & Remedies: Triphala Churna (Herbal Eye Cleanser) soaked in water overnight helps wash eyes. Brahmi & Shankhapushpi boost memory & eye clarity. Bilberry & Saffron Extracts support retinal function & night vision."
        ],
        image: "../images/weak eyes.jpg",
        callToAction: "Want sharper, clearer vision? Ayurveda naturally enhances eye strength!"
      },
      {
        title: "Conjunctivitis & Eye Infections (Abhishyanda & Netra Srava)",
        description: "Conjunctivitis (pink eye) and eye infections occur due to dust, bacteria, pollution, and Pitta imbalance. Ayurveda works on reducing inflammation, clearing infections, and soothing irritation naturally.",
        approach: [
          "Diet: Consume cooling foods like cucumber, coriander water, and fresh coconut water. Avoid spicy, fermented, and fried foods, which worsen eye infections.",
          "Lifestyle: Wash eyes with sterile Triphala water to clear mucus and redness. Avoid touching/rubbing eyes to prevent spreading infection.",
          "Herbs & Remedies: Rose water eye drops cool and reduce redness. Neem & Turmeric decoction is a natural antiseptic wash for eye infections. Coriander seed eye wash reduces swelling & irritation."
        ],
        image: "../images/Eye Infections.jpeg",
        callToAction: "Struggling with eye infections? Ayurveda provides natural relief without side effects!"
      }
    ]
  },
  "Oral Health": {
    title: "Ayurvedic Approach to Oral Health",
    description:
      "In Ayurveda, oral health is linked to 'Mukha Swasthya' (mouth hygiene) and is governed by all three doshas: Kapha affects gums and saliva production, Pitta influences inflammation and ulcers, and Vata impacts dryness and tooth sensitivity. Imbalances can lead to gum diseases, cavities, bad breath, and ulcers. Ayurveda emphasizes herbal oral care, oil pulling, and dietary changes for long-lasting dental health.",
    concerns: [
      {
        title: "Gum Disease & Bleeding Gums (Danta Roga & Sheetada)",
        description:
          "Bleeding, swollen, and receding gums are often caused by plaque buildup, poor oral hygiene, Pitta imbalance, and excessive spicy or acidic foods. Ayurveda focuses on strengthening gums, reducing inflammation, and maintaining oral hygiene.",
        approach: [
          "Diet: Increase calcium-rich foods like sesame seeds, almonds, and dairy. Avoid excess sugar, acidic foods, and alcohol.",
          "Lifestyle: Practice oil pulling with sesame or coconut oil daily. Massage gums with Triphala powder or honey.",
          "Herbs & Remedies: Use Babool (Acacia bark) & Neem twig brushing. Rinse with Triphala decoction. Apply Clove oil to stop bleeding."
        ],
        image: "../images/gumbleeding.jpeg",
        callToAction: "Struggling with bleeding gums? Ayurveda heals them naturally!"
      },
      {
        title: "Tooth Decay & Cavities (Danta Shaithilya & Krimi Danta)",
        description:
          "Cavities occur due to bacterial infection, poor diet, and weak enamel. Ayurveda aims to strengthen teeth, remove toxins, and prevent decay naturally.",
        approach: [
          "Diet: Consume calcium-rich foods like ragi, milk, and leafy greens. Avoid processed foods, excess sugar, and carbonated drinks.",
          "Lifestyle: Use oil pulling to prevent plaque and decay. Brush with herbal tooth powders like Neem, Babool, and Clove.",
          "Herbs & Remedies: Apply Babool bark & Clove powder paste. Rinse with Triphala & Neem decoction. Massage with Rock salt & Mustard oil."
        ],
        image: "../images/teeth cavity.jpeg",
        callToAction: "Prevent cavities with Ayurvedic oral care!"
      },
      {
        title: "Bad Breath & Mouth Ulcers (Mukha Durgandha & Mukhapaka)",
        description:
          "Bad breath (Halitosis) and mouth ulcers occur due to poor digestion, excess heat (Pitta imbalance), and bacterial growth. Ayurveda helps cool the mouth, detoxify, and improve digestion for fresh breath and ulcer relief.",
        approach: [
          "Diet: Eat cooling foods like cucumber, coconut water, and fennel seeds. Avoid onion, garlic, alcohol, and smoking.",
          "Lifestyle: Chew fennel seeds or cardamom after meals. Rinse mouth with Triphala or mint water daily.",
          "Herbs & Remedies: Apply Licorice root & Mulethi paste. Use Aloe vera & Honey gel for ulcer relief. Chew Clove & Cardamom for fresh breath."
        ],
        image: "../images/Mouth Ulcers.png",
        callToAction: "Struggling with bad breath or ulcers? Ayurveda restores oral freshness!"
      }
    ]
  },
  "General Wellness": {
    title: "Ayurvedic Approach to General Wellness & Detox",
    description:
      "In Ayurveda, 'Swasthya Rakshan' (maintaining health) is as important as treating diseases. Wellness and detoxification focus on removing toxins (Ama), rejuvenating tissues (Rasayana), and balancing doshas for a vibrant, disease-free life.",
    concerns: [
      {
        title: "Full Body Detox & Cleansing (Ama Nivarana & Shodhana)",
        description:
          "Over time, toxins (Ama) accumulate in the body due to poor digestion, pollution, stress, and processed foods. This leads to fatigue, sluggishness, skin issues, and digestive problems. Ayurveda offers natural detoxification methods to cleanse the body and restore balance.",
        approach: [
          "Diet: Follow a light diet with warm water, fresh fruits, vegetables, and whole grains. Avoid processed foods, sugar, and fried items.",
          "Lifestyle: Practice intermittent fasting, yoga, and deep breathing. Start mornings with warm lemon water and Triphala tea.",
          "Herbs & Remedies: Use Triphala, Neem, and Guduchi for detox. Drink coriander, fennel, and cumin tea to flush out toxins."
        ],
        image: "../images/Detox.jpg",
        callToAction: "Need a full-body cleanse? Ayurveda purifies naturally!"
      },
      {
        title: "Anti-Aging & Skin Rejuvenation (Rasayana Therapy & Twacha Raksha)",
        description:
          "Aging occurs due to natural degeneration, oxidative stress, and dosha imbalances. Ayurveda believes in slowing aging naturally by strengthening tissues, nourishing the skin, and promoting cellular renewal.",
        approach: [
          "Diet: Consume antioxidant-rich foods like amla, pomegranate, almonds, and ghee. Avoid excessive caffeine, alcohol, and junk food.",
          "Lifestyle: Follow a daily skincare routine with oil massage (Abhyanga) using sesame or almond oil. Practice meditation to reduce stress.",
          "Herbs & Remedies: Apply sandalwood & turmeric face masks. Use Ashwagandha & Shatavari for tissue regeneration. Drink saffron milk for glowing skin."
        ],
        image: "../images/Anti-Aging & Skin Rejuvenation.jpg",
        callToAction: "Want youthful skin? Ayurveda reverses aging naturally!"
      },
      {
        title: "Energy Boosters & Weakness Treatment (Bala Vriddhi & Ojas Enhancement)",
        description:
          "Low energy, constant fatigue, and muscle weakness result from Vata-Pitta imbalance, poor digestion, stress, and lack of nourishment. Ayurveda helps restore vitality, improve stamina, and boost immunity naturally.",
        approach: [
          "Diet: Eat energy-boosting foods like dates, nuts, honey, milk, and whole grains. Avoid cold, stale, and excessively spicy foods.",
          "Lifestyle: Maintain a proper sleep schedule, practice yoga, and engage in regular physical activity. Sun exposure in the morning boosts vitality.",
          "Herbs & Remedies: Use Ashwagandha, Brahmi, and Shatavari for energy. Drink warm milk with turmeric & ghee for strength."
        ],
        image: "../images/energy boost.jpg",
        callToAction: "Feeling drained? Ayurveda naturally restores energy!"
      }
    ]
  },
  "Infections": {
    title: "Ayurvedic Approach to Infections & Immunity Support",
    description:
      "Infections occur due to imbalanced doshas, weak immunity (Ojas), and Ama (toxins) accumulation. Ayurveda focuses on strengthening the body's natural defense mechanism through detoxification, herbal remedies, and lifestyle modifications.",
    concerns: [
      {
        title: "Common Cold & Flu Treatment (Jwara & Pratishyay Chikitsa)",
        description:
          "Colds and flu occur due to Kapha-Vata imbalances, exposure to seasonal changes, and a weakened immune system. Ayurveda treats them by reducing mucus, strengthening digestion, and boosting immunity naturally.",
        approach: [
          "Diet: Consume warm, light foods like soups, khichdi, and herbal teas. Avoid cold, fried, and dairy-heavy foods that increase mucus production.",
          "Lifestyle: Stay warm, rest adequately, practice steam inhalation with eucalyptus or tulsi leaves, and gargle with salt water.",
          "Herbs & Remedies: Use tulsi, ginger, black pepper, and honey in herbal teas. Drink turmeric milk to reduce inflammation and boost immunity."
        ],
        image: "../images/CommoncoldTreatment.jpg",
        callToAction: "Want to prevent colds naturally? Ayurveda enhances immunity!"
      },
      {
        title: "Bacterial, Viral & Fungal Infections (Krimi & Rakta Dushti Chikitsa)",
        description:
          "Infections arise from weakened immunity, excessive toxins (Ama), and bacterial or fungal overgrowth. Ayurveda eliminates harmful pathogens without disturbing the body's natural balance.",
        approach: [
          "Diet: Eat detoxifying foods like bitter greens, neem leaves, and turmeric-infused meals. Avoid sugar, processed foods, and excess dairy.",
          "Lifestyle: Maintain good hygiene, practice daily oil pulling, and take warm showers to prevent infections. Engage in pranayama for lung cleansing.",
          "Herbs & Remedies: Use neem, giloy, and turmeric for their antibacterial and antiviral properties. Apply aloe vera or neem paste for skin infections."
        ],
        image: "../images/Bacteriall Infections.jpg",
        callToAction: "Struggling with infections? Ayurveda treats them naturally!"
      },
      {
        title: "Recovery After Illness (Bala Vriddhi & Rasayana Chikitsa)",
        description:
          "After an illness, the body loses strength (Bala) and vital energy (Ojas). Recovery focuses on rebuilding immunity, restoring digestion, and revitalizing the body's natural energy levels.",
        approach: [
          "Diet: Include nourishing foods like ghee, warm milk, dates, almonds, and seasonal fruits. Avoid heavy, fried, or overly spicy foods that burden digestion.",
          "Lifestyle: Follow a proper sleep schedule, practice gentle yoga, and get morning sunlight exposure to restore energy and enhance immunity.",
          "Herbs & Remedies: Use ashwagandha, shatavari, and chyawanprash for strength. Drink herbal decoctions with mulethi and ginger for faster recovery."
        ],
        image: "../images/recovery_after_illnes.jpg",
        callToAction: "Feeling weak after an illness? Ayurveda speeds up recovery!"
      }
    ]
  },
  "Pain Management": {
    title: "Ayurvedic Approach to Pain Management",
    description:
      "Pain in Ayurveda is often linked to Vata imbalance, which disrupts the body's natural flow of energy and causes stiffness, aches, and discomfort. Ayurveda focuses on balancing Vata, reducing inflammation, improving circulation, and strengthening muscles and nerves to relieve pain naturally.",
    concerns: [
      {
        title: "Chronic Pain Relief (Nityavata Vedana Chikitsa)",
        description:
          "Chronic pain is often linked to accumulated toxins (Ama), nerve imbalances, or prolonged Vata disturbance. Ayurveda treats pain by reducing toxins, nourishing the body, and improving circulation.",
        approach: [
          "Diet: Include warm, easy-to-digest foods like soups, stews, and ghee. Avoid cold, dry, or processed foods that aggravate Vata.",
          "Lifestyle: Practice gentle yoga, avoid prolonged sitting, and engage in daily oil massages (Abhyanga) to improve circulation.",
          "Herbs & Remedies: Use ashwagandha, guggulu, and turmeric for pain relief. Apply warm sesame oil or mahanarayan oil to affected areas."
        ],
        image: "../images/crpain.jpg",
        callToAction: "Struggling with pain for months? Ayurveda can help!",
      },
      {
        title: "Muscle Cramps & Body Aches (Mamsagata Vedana Chikitsa)",
        description:
          "Muscle cramps and body aches occur due to electrolyte imbalances, weak blood circulation, and excessive Vata aggravation. Ayurveda focuses on muscle relaxation and deep nourishment.",
        approach: [
          "Diet: Eat potassium- and magnesium-rich foods like bananas, spinach, nuts, and dairy. Stay hydrated with herbal teas and warm water.",
          "Lifestyle: Engage in stretching exercises, get regular massages with warm oils, and practice deep breathing for muscle relaxation.",
          "Herbs & Remedies: Apply a paste of ginger and turmeric to sore muscles. Take triphala to remove toxins and improve blood circulation."
        ],
        image: "../images/Muscle Cramps.jpg",
        callToAction: "Tired of constant aches? Try Ayurveda for relief!",
      },
      {
        title: "Migraine & Headache Relief (Ardhavabhedaka Chikitsa)",
        description:
          "Migraines and headaches are often caused by Vata & Pitta imbalances, leading to nerve irritation, stress, and digestive toxins (Ama). Ayurveda focuses on calming the nervous system and detoxifying the body.",
        approach: [
          "Diet: Consume cooling and grounding foods like coconut water, ghee, and soaked almonds. Avoid spicy, oily, and fermented foods that trigger headaches.",
          "Lifestyle: Maintain a regular sleep schedule, practice stress management techniques like meditation, and avoid excessive screen time.",
          "Herbs & Remedies: Use Brahmi and Shankhpushpi for mental relaxation. Apply sandalwood paste on the forehead and drink tulsi tea for relief."
        ],
        image: "../images/Headache Relief.jpg",
        callToAction: "Suffering from migraines? Ayurveda treats the root cause!",
      },
      {
        title: "Nerve Pain & Neuropathy (Vatavyadhi Chikitsa)",
        description:
          "Nerve pain results from excess Vata causing weakness, tingling, or burning sensations in the body. Ayurveda strengthens nerves and reduces pain naturally.",
        approach: [
          "Diet: Include healthy fats like ghee, nuts, and sesame seeds. Avoid caffeine, alcohol, and processed foods that deplete nerve health.",
          "Lifestyle: Engage in daily warm oil massages (especially with sesame or mahanarayan oil), gentle yoga, and pranayama to improve nerve function.",
          "Herbs & Remedies: Use ashwagandha and Bala (Sida cordifolia) for nerve strength. Apply a turmeric and castor oil paste to affected areas."
        ],
        image: "../images/Nerve Pain.jpg",
        callToAction: "Nerve pain troubling you? Ayurveda offers long-term relief!",
      },
      {
        title: "Post-Surgery & Injury Recovery (Sandhigata Chikitsa)",
        description:
          "After surgery or injuries, the body needs proper nourishment, tissue repair, and immunity support to heal completely. Ayurveda speeds up recovery with deep nourishment.",
        approach: [
          "Diet: Eat protein-rich foods like lentils, dairy, and soaked nuts. Include turmeric, ginger, and fenugreek for faster healing.",
          "Lifestyle: Get adequate rest, practice mild movement to prevent stiffness, and use warm oil therapy for tissue repair.",
          "Herbs & Remedies: Take chyawanprash for immunity, ashwagandha for strength, and drink herbal milk with turmeric and saffron for recovery."
        ],
        image: "../images/Post-Surgery.jpg",
        callToAction: "Need a natural recovery plan? Ayurveda supports your healing!",
      },
    ],
  },
};

const ayurvedicConsultations = [
	{
		title: "Why Choose Ayurvedic Consultation?",
		points: [
			"Personalized Treatment based on Dosha balance.",
			"Natural Healing with diet, herbs, and lifestyle changes.",
			"Long-Term Relief rather than symptomatic suppression.",
			"Mind-Body Balance for holistic well-being.",
		],
		callToAction:
			"Not sure where to start? Book an online consultation with our certified Ayurvedic doctors today!",
	},
	{
		title: "Experience Holistic Healing with Ayurveda",
		points: [
			"Customized Ayurvedic plans for lasting health.",
			"Safe, natural, and effective herbal remedies.",
			"Root cause healing instead of temporary relief.",
			"Balance mind, body, and spirit with Ayurveda.",
		],
		callToAction:
			"Get expert guidance from Ayurvedic doctors. Book your consultation today!",
	},
	{
		title: "Heal Naturally with Ayurveda",
		points: [
			"Find the right Ayurvedic solution for your health needs.",
			"100% Natural remedies with no side effects.",
			"Restore harmony with holistic treatments.",
			"Prevent diseases with Ayurveda's ancient wisdom.",
		],
		callToAction:
			"Ready to take charge of your health? Connect with an Ayurvedic expert now!",
	},
];

function TreatmentDetailsScreen() {
	const { category } = useParams();
	const navigate = useNavigate();
	const details = treatmentData[decodeURIComponent(category)];

	if (!details) {
		return <h2>Category not found.</h2>;
	} 

	// Rotate consultation messages based on category index
	const consultationIndex =
		Object.keys(treatmentData).indexOf(category) %
		ayurvedicConsultations.length;
	const selectedConsultation = ayurvedicConsultations[consultationIndex];

	return (
		<div className="treatment-details">
			<Link to="/treatments" className="back-link">
				← Back
			</Link>
			<h1>{details.title}</h1>
			<p>{details.description}</p>
			<h2 className="ttitle">Common Concerns & Ayurvedic Approach</h2>

			{details.concerns.map((concern, index) => (
				<div
					key={index}
					className={`concern-row ${index % 2 === 0 ? "row-reverse" : ""}`}
				>
					<img
						src={concern.image}
						alt={concern.title}
						className="concern-image"
					/>
					<div className="concern-content">
						<h3>{concern.title}</h3>
						<p>{concern.description}</p>
						<h4>Ayurvedic Approach:</h4>
						<ul>
							{concern.approach.map((step, i) => (
								<li key={i}>{step}</li>
							))}
						</ul>
						<p>{concern.callToAction}</p>
					</div>
				</div>
			))}

			{/* Ayurvedic Consultation Section (Rotating Messages) */}
			<div className="consultation-section">
				<h2>{selectedConsultation.title}</h2>
				<ul>
					{selectedConsultation.points.map((point, index) => (
						<li key={index}>{point}</li>
					))}
				</ul>
				<p>{selectedConsultation.callToAction}</p>
			</div>
		</div>
	);
}

export default TreatmentDetailsScreen;
