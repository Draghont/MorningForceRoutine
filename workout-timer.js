// ========================================
// WORKOUT TIMER - STEP 1: FOUNDATION (NEW JSON STRUCTURE)
// ========================================

class ConfigurationManager {
  constructor() {
    this.externalTiming = null;
    this.externalI18n = null;
    this.isExternalLoaded = false;
  }

  async loadExternalFiles() {
    console.log('🔍 Attempting to load external JSON files...');
    
    try {
      // Try to load both files
      const [timingResponse, i18nResponse] = await Promise.all([
        fetch('./workout_exercise_sequence_and_time.json'),
        fetch('./workout_exercise_text_and_i18n.json')
      ]);

      if (timingResponse.ok && i18nResponse.ok) {
        this.externalTiming = await timingResponse.json();
        this.externalI18n = await i18nResponse.json();
        
        // Validate the files match
        const validationResult = this.validateFiles(this.externalTiming, this.externalI18n);
        if (validationResult.isValid) {
          this.isExternalLoaded = true;
          console.log('✅ External JSON files loaded and validated successfully');
          return true;
        } else {
          console.error('❌ External JSON files validation failed:', validationResult.errors);
          alert(`JSON files validation failed:\n${validationResult.errors.join('\n')}`);
          return false;
        }
      } else {
        console.log('📁 External JSON files not found, using embedded defaults');
        return false;
      }
    } catch (error) {
      console.log('📁 External JSON files not available, using embedded defaults:', error.message);
      return false;
    }
  }

  validateFiles(timing, i18n) {
    const errors = [];
    
    // Check schema versions
    if (timing.schema_version !== 'timed-v1') {
      errors.push(`Timing schema version should be 'timed-v1', found: ${timing.schema_version}`);
    }
    if (i18n.schema_version !== 'i18n-v1') {
      errors.push(`I18n schema version should be 'i18n-v1', found: ${i18n.schema_version}`);
    }

    // Check all exercise IDs in timing file exist in i18n file
    const timingExerciseIds = new Set(timing.exercises.map(ex => ex.id));
    const i18nExerciseIds = new Set(Object.keys(i18n.exercises));
    
    for (const id of timingExerciseIds) {
      if (!i18nExerciseIds.has(id)) {
        errors.push(`Exercise ID '${id}' found in timing file but missing in i18n file`);
      }
    }

    // Check all block IDs in timing file exist in i18n blocks
    const timingBlockIds = new Set([...timing.sequence, ...timing.exercises.map(ex => ex.block)]);
    const i18nBlockIds = new Set(Object.keys(i18n.blocks.it || {}));
    
    for (const blockId of timingBlockIds) {
      if (!i18nBlockIds.has(blockId)) {
        errors.push(`Block ID '${blockId}' found in timing file but missing in i18n blocks`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  getConfig() {
    if (this.isExternalLoaded) {
      console.log('📊 Using external JSON configuration');
      return {
        timing: this.externalTiming,
        i18n: this.externalI18n,
        isExternal: true
      };
    } else {
      console.log('💾 Using embedded configuration');
      return {
        timing: WorkoutTimer.getEmbeddedTiming(),
        i18n: WorkoutTimer.getEmbeddedI18n(),
        isExternal: false
      };
    }
  }
}

class WorkoutTimer {
  static BLOCK_COLORS = {
    'activation': '#4ade80',
    'warmup_standing': '#60a5fa', 
    'warmup_floor': '#f87171',
    'strength_standing': '#fbbf24',
    'strength_floor': '#a78bfa',
    'stretching': '#06b6d4'
  };
  
  static getEmbeddedTiming() {
    return {
      schema_version: "timed-v1",
      config: {
        countdown_s: 3,
        up_next_notice_s: 5,
        block_rest_s: {
          activation: 15,
          warmup_standing: 15,
          warmup_floor: 20,
          strength_standing: 20,
          strength_floor: 15
        }
      },
      sequence: [
        "activation",
        "warmup_standing", 
        "warmup_floor",
        "strength_standing",
        "strength_floor",
        "stretching"
      ],
      exercises: [
        { n: 1, id: "neck_rot_tilt", block: "activation", work_s: 30, setup_s: 0 },
        { n: 2, id: "shoulder_circ_fw", block: "activation", work_s: 30, setup_s: 0 },
        { n: 3, id: "shoulder_circ_bw", block: "activation", work_s: 30, setup_s: 0 },
        { n: 4, id: "thoracic_twists", block: "activation", work_s: 30, setup_s: 0 },
        { n: 5, id: "hip_circles_cw", block: "activation", work_s: 30, setup_s: 0 },
        { n: 6, id: "hip_circles_ccw", block: "activation", work_s: 30, setup_s: 0 },
        { n: 7, id: "march_in_place", block: "activation", work_s: 30, setup_s: 0 },
        { n: 8, id: "cat_cow", block: "activation", work_s: 30, setup_s: 2 },
        { n: 9, id: "mil_press_bw", block: "warmup_standing", work_s: 30, setup_s: 2 },
        { n: 10, id: "rev_fly_bw", block: "warmup_standing", work_s: 30, setup_s: 0 },
        { n: 11, id: "wall_pushup", block: "warmup_standing", work_s: 30, setup_s: 4 },
        { n: 12, id: "hip_hinge_bw", block: "warmup_standing", work_s: 30, setup_s: 0 },
        { n: 13, id: "squat_bw", block: "warmup_standing", work_s: 30, setup_s: 0 },
        { n: 14, id: "calf_raise_bw", block: "warmup_standing", work_s: 30, setup_s: 0 },
        { n: 15, id: "plank_front", block: "warmup_floor", work_s: 30, setup_s: 3 },
        { n: 16, id: "russian_twist_bw", block: "warmup_floor", work_s: 30, setup_s: 5 },
        { n: 17, id: "banded_psoas_march", block: "warmup_floor", work_s: 30, setup_s: 10 },
        { n: 18, id: "glute_bridge_bi", block: "warmup_floor", work_s: 30, setup_s: 2 },
        { n: 19, id: "sliding_curl_bi", block: "warmup_floor", work_s: 30, setup_s: 5 },
        { n: 20, id: "superman_hold", block: "warmup_floor", work_s: 30, setup_s: 3 },
        { n: 21, id: "mil_press_load", block: "strength_standing", work_s: 30, setup_s: 10 },
        { n: 22, id: "rev_fly_load", block: "strength_standing", work_s: 30, setup_s: 5 },
        { n: 23, id: "hip_hinge_load", block: "strength_standing", work_s: 30, setup_s: 5 },
        { n: 24, id: "squat_load_or_jump", block: "strength_standing", work_s: 30, setup_s: 10 },
        { n: 25, id: "calf_raise_load", block: "strength_standing", work_s: 30, setup_s: 5 },
        { n: 26, id: "plank_alt", block: "strength_floor", work_s: 30, setup_s: 5 },
        { n: 27, id: "incline_pushup", block: "strength_floor", work_s: 30, setup_s: 0 },
        { n: 28, id: "russian_twist_weighted", block: "strength_floor", work_s: 30, setup_s: 5 },
        { n: 29, id: "superman_band", block: "strength_floor", work_s: 30, setup_s: 2 },
        { n: 30, id: "glute_bridge_1g", block: "strength_floor", work_s: 30, setup_s: 2 },
        { n: 31, id: "nhe_push", block: "strength_floor", work_s: 30, setup_s: 15 },
        { n: 32, id: "neck_lat_r", block: "stretching", work_s: 30, setup_s: 0 },
        { n: 33, id: "neck_lat_l", block: "stretching", work_s: 30, setup_s: 0 },
        { n: 34, id: "pec_door", block: "stretching", work_s: 30, setup_s: 0 },
        { n: 35, id: "child_pose", block: "stretching", work_s: 30, setup_s: 0 },
        { n: 36, id: "quad_r", block: "stretching", work_s: 30, setup_s: 0 },
        { n: 37, id: "quad_l", block: "stretching", work_s: 30, setup_s: 0 },
        { n: 38, id: "calf_r", block: "stretching", work_s: 30, setup_s: 0 },
        { n: 39, id: "calf_l", block: "stretching", work_s: 30, setup_s: 0 },
        { n: 40, id: "worlds_greatest_stretch", block: "stretching", work_s: 30, setup_s: 2 }
      ]
    };
  }

  static getEmbeddedI18n() {
    return {
      schema_version: "i18n-v1",
      languages: ["it", "en"],
      ui: {
        it: {
          title: "Passeggiata della Forza — Week 1",
          subtitle: "Routine mattutina veloce: accensione → riscaldamento → potenziamento → stretching",
          startBtn: "Inizia",
          pauseBtn: "Pausa",
          resumeBtn: "Riprendi",
          resetBtn: "Reset",
          exerciseTab: "Esercizio",
          scheduleTab: "Programma",
          upNext: "Prossimo:",
          readyMessage: "Premi Inizia per cominciare",
          readyDescription: "Il tuo allenamento è pronto!",
          congratsTitle: "🎉 Congratulazioni!",
          congratsSubtitle: "Hai completato la Passeggiata della Forza!",
          newWorkoutBtn: "Nuovo Allenamento",
          goText: "VIA!",
          totalProgress: "Progresso Totale",
          currentExercise: "Esercizio Corrente",
          setupExercise: "Prepara l'esercizio:",
          countdown: "Inizia tra",
          tableHeaders: { time: "Minuto", block: "Blocco", exercise: "Esercizio", duration: "Tempo" }
        },
        en: {
          title: "Strength Walk — Week 1",
          subtitle: "Quick morning routine: activation → warm-up → strengthening → stretching",
          startBtn: "Start",
          pauseBtn: "Pause",
          resumeBtn: "Resume",
          resetBtn: "Reset",
          exerciseTab: "Exercise",
          scheduleTab: "Schedule",
          upNext: "Up next:",
          readyMessage: "Press Start to begin",
          readyDescription: "Your workout is ready!",
          congratsTitle: "🎉 Congratulations!",
          congratsSubtitle: "You've completed your Strength Walk!",
          newWorkoutBtn: "New Workout",
          goText: "GO!",
          totalProgress: "Total Progress",
          currentExercise: "Current Exercise",
          setupExercise: "Prepare for exercise:",
          countdown: "Starting in",
          tableHeaders: { time: "Time", block: "Block", exercise: "Exercise", duration: "Duration" }
        }
      },
      blocks: {
        it: {
          activation: "Accensione",
          warmup_standing: "Riscald. in piedi",
          warmup_floor: "Riscald. a terra",
          strength_standing: "Potenz. in piedi",
          strength_floor: "Potenz. a terra",
          stretching: "Stretching"
        },
        en: {
          activation: "Activation",
          warmup_standing: "Standing warm-up",
          warmup_floor: "Floor warm-up",
          strength_standing: "Standing strength",
          strength_floor: "Floor strength",
          stretching: "Stretching"
        }
      },
      exercises: {
        neck_rot_tilt: {
          icon: "🙆",
          it: { name: "Rotazioni + inclinazioni collo", description: "Muovi delicatamente il collo in tutte le direzioni per risvegliare la muscolatura.", setup_hint: "Rimani in piedi." },
          en: { name: "Neck rotations + tilts", description: "Gently move your neck in all directions to wake up the muscles.", setup_hint: "Stay standing." }
        },
        shoulder_circ_fw: {
          icon: "🔄",
          it: { name: "Circonduzioni spalle (avanti)", description: "Rotazioni ampie in avanti per mobilizzare le spalle.", setup_hint: "Rimani in piedi." },
          en: { name: "Shoulder circles (forward)", description: "Large forward circles to mobilize the shoulders.", setup_hint: "Stay standing." }
        },
        shoulder_circ_bw: {
          icon: "↩️",
          it: { name: "Circonduzioni spalle (indietro)", description: "Rotazioni ampie all'indietro per attivare la spalla.", setup_hint: "Rimani in piedi." },
          en: { name: "Shoulder circles (backward)", description: "Large backward circles to activate the shoulders.", setup_hint: "Stay standing." }
        },
        thoracic_twists: {
          icon: "🌀",
          it: { name: "Torsioni toraciche morbide", description: "Torsioni dolci del busto per attivare la colonna.", setup_hint: "Rimani in piedi." },
          en: { name: "Gentle thoracic twists", description: "Soft torso twists to activate the spine.", setup_hint: "Stay standing." }
        },
        hip_circles_cw: {
          icon: "⭕",
          it: { name: "Circonduzioni anche (orario)", description: "Rotazioni dell'anca in senso orario per mobilità.", setup_hint: "Rimani in piedi." },
          en: { name: "Hip circles (clockwise)", description: "Clockwise hip rotations for mobility.", setup_hint: "Stay standing." }
        },
        hip_circles_ccw: {
          icon: "🔄",
          it: { name: "Circonduzioni anche (antiorario)", description: "Rotazioni dell'anca in senso antiorario per mobilità.", setup_hint: "Rimani in piedi." },
          en: { name: "Hip circles (counterclockwise)", description: "Counterclockwise hip rotations for mobility.", setup_hint: "Stay standing." }
        },
        march_in_place: {
          icon: "🚶",
          it: { name: "Marcia sul posto", description: "Marcia energica per attivare circolazione e caviglie.", setup_hint: "Rimani in piedi." },
          en: { name: "March in place", description: "Energetic marching to boost circulation and ankles.", setup_hint: "Stay standing." }
        },
        cat_cow: {
          icon: "🐈‍⬛",
          it: { name: "Cat–Cow (mobilizzazione spinale)", description: "Alterna inarcamento e arrotondamento per mobilizzare la colonna.", setup_hint: "Vai a terra a quattro appoggi." },
          en: { name: "Cat–Cow (spinal mobilization)", description: "Alternate arch and round positions to mobilize the spine.", setup_hint: "Go to the floor on all fours." }
        },
        mil_press_bw: {
          icon: "💪",
          it: { name: "Military press a corpo libero", description: "Simula la spinta verticale senza carico per attivare le spalle.", setup_hint: "Alzati." },
          en: { name: "Bodyweight military press", description: "Simulate a vertical press to activate shoulders.", setup_hint: "Stand up." }
        },
        rev_fly_bw: {
          icon: "🦅",
          it: { name: "Reverse fly (busto flesso)", description: "Apertura braccia con busto inclinato per deltoidi posteriori.", setup_hint: "Rimani in piedi e inclina il busto." },
          en: { name: "Reverse fly (bent-over)", description: "Arm opens in a hip hinge to target rear delts.", setup_hint: "Stay standing and hinge forward." }
        },
        wall_pushup: {
          icon: "🏠",
          it: { name: "Push-up verticali al muro", description: "Piegamenti contro il muro per petto e tricipiti.", setup_hint: "Vai al muro." },
          en: { name: "Wall push-ups", description: "Vertical push-ups against a wall for chest and triceps.", setup_hint: "Go to the wall." }
        },
        hip_hinge_bw: {
          icon: "🏋️",
          it: { name: "Hip hinge (senza carico)", description: "Cerniera d'anca controllata per attivare la catena posteriore.", setup_hint: "Rimani in piedi, libera lo spazio." },
          en: { name: "Hip hinge (no load)", description: "Controlled hip hinge to engage posterior chain.", setup_hint: "Stay standing, clear space." }
        },
        squat_bw: {
          icon: "⬇️",
          it: { name: "Squat corpo libero", description: "Squat di riscaldamento per glutei e gambe.", setup_hint: "Rimani in piedi." },
          en: { name: "Bodyweight squat", description: "Warm-up squats for glutes and legs.", setup_hint: "Stay standing." }
        },
        calf_raise_bw: {
          icon: "👠",
          it: { name: "Calf raise", description: "Sollevamenti sui polpacci per attivare il tricipite surale.", setup_hint: "Rimani in piedi vicino a un appoggio." },
          en: { name: "Calf raises", description: "Raise onto toes to activate the calves.", setup_hint: "Stay standing near support." }
        },
        plank_front: {
          icon: "📏",
          it: { name: "Plank frontale", description: "Tenuta isometrica per attivare il core.", setup_hint: "Abbassati a terra." },
          en: { name: "Front plank", description: "Isometric hold to activate the core.", setup_hint: "Go down to the floor." }
        },
        russian_twist_bw: {
          icon: "🌪️",
          it: { name: "Russian twist (corpo libero)", description: "Rotazioni del busto con colonna neutra, arco ridotto.", setup_hint: "Siediti a terra (cambia posizione)." },
          en: { name: "Russian twist (bodyweight)", description: "Torso rotations with neutral spine, small arc.", setup_hint: "Sit on the floor (change position)." }
        },
        banded_psoas_march: {
          icon: "🏃",
          it: { name: "Banded Psoas March (90/90)", description: "Marcia 90/90 con miniband ai piedi per i flessori d'anca.", setup_hint: "Prendi la miniband." },
          en: { name: "Banded Psoas March (90/90)", description: "90/90 march with miniband on feet for hip flexors.", setup_hint: "Grab the miniband." }
        },
        glute_bridge_bi: {
          icon: "🌉",
          it: { name: "Glute bridge (bilaterale)", description: "Ponte bilaterale per attivare glutei e femorali.", setup_hint: "Sdraiati supino (cambia posizione)." },
          en: { name: "Glute bridge (bilateral)", description: "Bilateral bridge to activate glutes and hamstrings.", setup_hint: "Lie on your back (change position)." }
        },
        sliding_curl_bi: {
          icon: "🦵",
          it: { name: "Sliding leg curl (bilaterale)", description: "Fai scivolare i talloni su dischi/panni per i femorali.", setup_hint: "Prepara i dischi/panni (cambia posizione)." },
          en: { name: "Sliding leg curl (bilateral)", description: "Slide heels on discs/towels to load hamstrings.", setup_hint: "Set sliders/towels under heels (change position)." }
        },
        superman_hold: {
          icon: "🦸",
          it: { name: "Superman hold", description: "Tenuta a pancia in giù per catena posteriore.", setup_hint: "Sdraiati prono (cambia posizione)." },
          en: { name: "Superman hold", description: "Prone hold for posterior chain.", setup_hint: "Lie prone (change position)." }
        },
        mil_press_load: {
          icon: "🏋️",
          it: { name: "Military press (elastico/manubri)", description: "Spinta verticale con carico per spalle e tricipiti.", setup_hint: "Alzati e prendi pesi medi o banda." },
          en: { name: "Military press (band/dumbbells)", description: "Vertical press with load for shoulders and triceps.", setup_hint: "Stand up and grab medium weights or band." }
        },
        rev_fly_load: {
          icon: "🦋",
          it: { name: "Reverse fly (elastico/manubri)", description: "Apertura con resistenza per deltoidi posteriori.", setup_hint: "Prendi pesi leggeri o banda." },
          en: { name: "Reverse fly (band/dumbbells)", description: "Rear-delt fly with resistance.", setup_hint: "Grab light weights or band." }
        },
        hip_hinge_load: {
          icon: "⚖️",
          it: { name: "Hip hinge (con carico)", description: "Cerniera d'anca con carico per glutei/femorali.", setup_hint: "Prendi pesi medi o banda." },
          en: { name: "Hip hinge (loaded)", description: "Loaded hip hinge for glutes/hamstrings.", setup_hint: "Grab medium weights or band." }
        },
        squat_load_or_jump: {
          icon: "⚡",
          it: { name: "Squat zavorrato o jump squat", description: "Squat con carico o balzato per potenza gambe.", setup_hint: "Prendi pesi pesanti (o libera spazio per saltare)." },
          en: { name: "Weighted squat or jump squat", description: "Loaded or jump squats for leg power.", setup_hint: "Grab heavy weights (or clear space to jump)." }
        },
        calf_raise_load: {
          icon: "🏔️",
          it: { name: "Calf raise su gradino (con peso)", description: "Polpacci su gradino con ROM completo.", setup_hint: "Prendi manubri e un gradino." },
          en: { name: "Calf raises on step (with weight)", description: "Calf raises on a step with full ROM.", setup_hint: "Grab dumbbells and a step." }
        },
        plank_alt: {
          icon: "🤸",
          it: { name: "Plank con sollevamento alternato", description: "Plank con sollevamenti opposti braccio/gamba.", setup_hint: "Vai a terra (tappetino)." },
          en: { name: "Plank with alternating arm/leg lifts", description: "Plank with opposite arm/leg lifts.", setup_hint: "Go to the floor (mat)." }
        },
        incline_pushup: {
          icon: "📐",
          it: { name: "Push-up inclinati", description: "Piegamenti su rialzo per petto e tricipiti.", setup_hint: "Nessun setup." },
          en: { name: "Incline push-ups", description: "Push-ups on an elevation for chest and triceps.", setup_hint: "No setup." }
        },
        russian_twist_weighted: {
          icon: "🪨",
          it: { name: "Russian twist (con carico)", description: "Rotazioni con peso, arco controllato e core attivo.", setup_hint: "Prendi un peso leggero." },
          en: { name: "Russian twist (weighted)", description: "Rotations with load, controlled arc and active core.", setup_hint: "Grab a light weight." }
        },
        superman_band: {
          icon: "🦸‍♂️",
          it: { name: "Superman con miniband caviglie", description: "Estensioni prone con elastico alle caviglie.", setup_hint: "Metti la miniband alle caviglie (cambia posizione)." },
          en: { name: "Superman with ankle miniband", description: "Prone extensions with miniband at ankles.", setup_hint: "Set miniband at ankles (change position)." }
        },
        glute_bridge_1g: {
          icon: "🦵",
          it: { name: "Glute bridge a 1 gamba", description: "Ponte unilaterale, bacino in bolla, spinta sul tallone.", setup_hint: "Sdraiati supino (cambia posizione)." },
          en: { name: "Single-leg glute bridge", description: "Unilateral bridge, level pelvis, drive through heel.", setup_hint: "Lie on your back (change position)." }
        },
        nhe_push: {
          icon: "🦌",
          it: { name: "Nordic hamstring eccentrico + push-up assistito", description: "Discesa lenta con caviglie ancorate; risalita aiutata.", setup_hint: "Trova un punto per fissare le caviglie." },
          en: { name: "Nordic hamstring (eccentric) + assisted push-up", description: "Slow descent with ankles anchored; assisted return.", setup_hint: "Find a place to anchor your ankles." }
        },
        neck_lat_r: {
          icon: "🙇",
          it: { name: "Allungamento collo laterale — destro", description: "Inclinazione laterale per distendere il trapezio superiore.", setup_hint: "Rimani in piedi." },
          en: { name: "Neck lateral stretch — right", description: "Lateral tilt to stretch upper trapezius.", setup_hint: "Stay standing." }
        },
        neck_lat_l: {
          icon: "🙇",
          it: { name: "Allungamento collo laterale — sinistro", description: "Inclinazione laterale per distendere il trapezio superiore.", setup_hint: "Rimani in piedi." },
          en: { name: "Neck lateral stretch — left", description: "Lateral tilt to stretch upper trapezius.", setup_hint: "Stay standing." }
        },
        pec_door: {
          icon: "🚪",
          it: { name: "Pettorali su porta", description: "Stretch pettorale con avambraccio sul telaio della porta.", setup_hint: "Trova un telaio della porta." },
          en: { name: "Doorway pec stretch", description: "Pec stretch with forearm on doorframe.", setup_hint: "Find a doorframe." }
        },
        child_pose: {
          icon: "🧘",
          it: { name: "Child pose", description: "Posizione del bambino per rilassare schiena e spalle.", setup_hint: "Vai a terra (tappetino)." },
          en: { name: "Child's pose", description: "Child's pose to relax back and shoulders.", setup_hint: "Go to the floor (mat)." }
        },
        quad_r: {
          icon: "🦵",
          it: { name: "Quadricipite — destro", description: "Presa del collo del piede e ginocchia vicine.", setup_hint: "Rimani in piedi vicino a un appoggio." },
          en: { name: "Quadriceps — right", description: "Grab ankle, keep knees close together.", setup_hint: "Stay standing near support." }
        },
        quad_l: {
          icon: "🦵",
          it: { name: "Quadricipite — sinistro", description: "Presa del collo del piede e ginocchia vicine.", setup_hint: "Rimani in piedi vicino a un appoggio." },
          en: { name: "Quadriceps — left", description: "Grab ankle, keep knees close together.", setup_hint: "Stay standing near support." }
        },
        calf_r: {
          icon: "🧱",
          it: { name: "Polpaccio al muro — destro", description: "Spingi contro il muro mantenendo il tallone a terra.", setup_hint: "Vai al muro." },
          en: { name: "Calf stretch on wall — right", description: "Press into wall keeping heel on the floor.", setup_hint: "Go to the wall." }
        },
        calf_l: {
          icon: "🧱",
          it: { name: "Polpaccio al muro — sinistro", description: "Spingi contro il muro mantenendo il tallone a terra.", setup_hint: "Vai al muro." },
          en: { name: "Calf stretch on wall — left", description: "Press into wall keeping heel on the floor.", setup_hint: "Go to the wall." }
        },
        worlds_greatest_stretch: {
          icon: "🌍",
          it: { name: "World's Greatest Stretch", description: "Affondo profondo con rotazione toracica e cambio lato.", setup_hint: "Trova un materassino." },
          en: { name: "World's Greatest Stretch", description: "Deep lunge with thoracic rotation; switch sides.", setup_hint: "Find a mat." }
        }
      }
    };
  }
  
  constructor() {
    this.configManager = new ConfigurationManager();
    this.state = {
      currentLang: 'it',
      currentExerciseIndex: -1,
      isRunning: false,
      isPaused: false,
      totalElapsedSeconds: 0,
      exerciseElapsedSeconds: 0,
      currentPhase: 'ready', // ready, countdown, setup, work, rest, complete
      timer: null,
      audioContext: null
    };
    
    this.dom = this.initializeDOM();
    this.config = null;
    this.exercises = [];
    this.processedExercises = [];
    
    this.init();
  }
  
  initializeDOM() {
    const safeGetElement = (id) => {
      const element = document.getElementById(id);
      if (!element) {
        console.warn(`Element with id '${id}' not found`);
      }
      return element;
    };
    
    return {
      playBtn: safeGetElement('playBtn'),
      pauseBtn: safeGetElement('pauseBtn'),
      resetBtn: safeGetElement('resetBtn'),
      timerDisplay: safeGetElement('timerDisplay'),
      progressFill: safeGetElement('progressFill'),
      progressPercentage: safeGetElement('progressPercentage'),
      exerciseProgressContainer: safeGetElement('exerciseProgressContainer'),
      exerciseProgressFill: safeGetElement('exerciseProgressFill'),
      exerciseProgressPercentage: safeGetElement('exerciseProgressPercentage'),
      exerciseProgressLabel: safeGetElement('exerciseProgressLabel'),
      exerciseIcon: safeGetElement('exerciseIcon'),
      exerciseName: safeGetElement('exerciseName'),
      exerciseBlock: safeGetElement('exerciseBlock'),
      exerciseDescription: safeGetElement('exerciseDescription'),
      upNext: safeGetElement('upNext'),
      nextExercise: safeGetElement('nextExercise'),
      exerciseTableBody: safeGetElement('exerciseTableBody'),
      mainTitle: safeGetElement('mainTitle'),
      mainSubtitle: safeGetElement('mainSubtitle'),
      progressLabel: document.querySelector('.progress-info .progress-label'),
      headers: document.querySelectorAll('thead th'),
      tabBtns: document.querySelectorAll('.tab-btn'),
      currentExerciseTab: safeGetElement('currentExercise'),
      workoutTableTab: safeGetElement('workoutTable')
    };
  }

  async init() {
    console.log('🚀 Starting WorkoutTimer with new JSON structure (Step 1)');
    
    // Load configuration (external or embedded)
    await this.configManager.loadExternalFiles();
    this.config = this.configManager.getConfig();
    
    // Process exercises and calculate timing
    this.processExercises();
    
    // Controlla parametro lang nell'URL se disponibile
    this.checkURLLanguage();
    
    // Aspetta che il DOM sia pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.finishInit();
      });
    } else {
      this.finishInit();
    }
  }

  processExercises() {
    const timing = this.config.timing;
    const i18n = this.config.i18n;
    
    let currentTime = 0;
    let currentBlock = null;
    this.processedExercises = [];
    
    timing.exercises.forEach((exercise, index) => {
      // Add block rest if entering a new block
      if (currentBlock !== null && currentBlock !== exercise.block) {
        const blockRestSeconds = timing.config.block_rest_s[currentBlock] || 0;
        if (blockRestSeconds > 0) {
          currentTime += blockRestSeconds;
        }
      }
      currentBlock = exercise.block;
      
      // Get exercise data from i18n
      const exerciseData = i18n.exercises[exercise.id];
      const currentLang = this.state.currentLang;
      
      // Calculate setup and work phases
      const setupStartTime = currentTime;
      const workStartTime = currentTime + exercise.setup_s;
      const exerciseEndTime = workStartTime + exercise.work_s;
      
      // Create processed exercise
      const processedExercise = {
        id: exercise.id,
        n: exercise.n,
        block: exercise.block,
        setupStartTime: setupStartTime,
        workStartTime: workStartTime,
        endTime: exerciseEndTime,
        setup_s: exercise.setup_s,
        work_s: exercise.work_s,
        totalDuration: exercise.setup_s + exercise.work_s,
        icon: exerciseData.icon,
        blockName: i18n.blocks[currentLang][exercise.block] || exercise.block,
        name: exerciseData[currentLang].name,
        description: exerciseData[currentLang].description,
        setupHint: exerciseData[currentLang].setup_hint
      };
      
      this.processedExercises.push(processedExercise);
      currentTime = exerciseEndTime;
    });
    
    this.totalWorkoutSeconds = currentTime;
    console.log(`📊 Processed ${this.processedExercises.length} exercises, total duration: ${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}`);
  }
  
  checkURLLanguage() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam && this.config.i18n.languages.includes(langParam)) {
        this.state.currentLang = langParam;
      }
    } catch (e) {
      console.log('URL params not available in this environment');
    }
  }
  
  finishInit() {
    this.setLanguage(this.state.currentLang);
    this.setupEventListeners();
    this.initAudio();
    this.populateTable();
    this.updateDisplay();
  }

  setupEventListeners() {
    // Main controls
    if (this.dom.playBtn) {
      this.dom.playBtn.addEventListener('click', () => this.start());
    }
    if (this.dom.pauseBtn) {
      this.dom.pauseBtn.addEventListener('click', () => this.pause());
    }
    if (this.dom.resetBtn) {
      this.dom.resetBtn.addEventListener('click', () => this.reset());
    }

    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.target.dataset.lang;
        if (lang) {
          this.setLanguage(lang);
        }
      });
    });

    // Tab switching for mobile
    document.querySelectorAll('.tab-btn').forEach((btn, index) => {
      btn.addEventListener('click', () => WorkoutTimer.switchTab(index));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!this.state.isRunning) {
          this.start();
        } else if (this.state.isPaused) {
          this.start();
        } else {
          this.pause();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        this.reset();
      }
    });
  }

  initAudio() {
    try {
      this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Audio context not supported');
    }
  }
  
  playBeep() {
    if (!this.state.audioContext) return;
    
    try {
      const oscillator = this.state.audioContext.createOscillator();
      const gainNode = this.state.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.state.audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, this.state.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.state.audioContext.currentTime + 0.3);
      
      oscillator.start(this.state.audioContext.currentTime);
      oscillator.stop(this.state.audioContext.currentTime + 0.3);
    } catch (e) {
      console.log('Error playing beep:', e);
    }
  }

  setLanguage(lang) {
    if (!this.config.i18n.languages.includes(lang)) {
      console.warn(`Language '${lang}' not supported, falling back to 'it'`);
      lang = 'it';
    }
    
    this.state.currentLang = lang;
    
    // Reprocess exercises with new language
    this.processExercises();
    
    // Update interface
    this.updateLanguageUI();
    this.populateTable();
    this.updateDisplay();
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }
  
  updateLanguageUI() {
    const ui = this.config.i18n.ui[this.state.currentLang];
    
    // Update main texts
    this.safeUpdateTextContent(this.dom.mainTitle, ui.title);
    this.safeUpdateTextContent(this.dom.mainSubtitle, ui.subtitle);
    this.safeUpdateTextContent(this.dom.progressLabel, ui.totalProgress);
    this.safeUpdateTextContent(this.dom.exerciseProgressLabel, ui.currentExercise);
    
    // Update buttons
    this.updateButtonText(this.dom.playBtn, this.state.isPaused ? ui.resumeBtn : ui.startBtn);
    this.updateButtonText(this.dom.pauseBtn, ui.pauseBtn);
    this.updateButtonText(this.dom.resetBtn, ui.resetBtn);
    
    // Update tab buttons
    if (this.dom.tabBtns.length >= 2) {
      this.safeUpdateTextContent(this.dom.tabBtns[0], ui.exerciseTab);
      this.safeUpdateTextContent(this.dom.tabBtns[1], ui.scheduleTab);
    }
    
    // Update current exercise display
    if (this.state.currentExerciseIndex === -1) {
      this.safeUpdateTextContent(this.dom.exerciseName, ui.readyMessage);
      this.safeUpdateTextContent(this.dom.exerciseDescription, ui.readyDescription);
      this.safeUpdateTextContent(this.dom.exerciseBlock, '');
    } else if (this.state.currentExerciseIndex >= 0 && this.state.currentExerciseIndex < this.processedExercises.length) {
      const exercise = this.processedExercises[this.state.currentExerciseIndex];
      this.updateExerciseDisplay(exercise);
    }
    
    // Update table headers
    if (this.dom.headers.length >= 4) {
      this.safeUpdateTextContent(this.dom.headers[0], ui.tableHeaders.time);
      this.safeUpdateTextContent(this.dom.headers[1], ui.tableHeaders.block);
      this.safeUpdateTextContent(this.dom.headers[2], ui.tableHeaders.exercise);
      this.safeUpdateTextContent(this.dom.headers[3], ui.tableHeaders.duration);
    }
  }

  safeUpdateTextContent(element, text) {
    if (element && text !== undefined) {
      element.textContent = text;
    }
  }

  updateButtonText(button, text) {
    if (button && text) {
      const template = button.querySelector('.btn-text');
      if (template) {
        template.textContent = text;
      } else {
        button.textContent = text;
      }
    }
  }

  populateTable() {
    if (!this.dom.exerciseTableBody) return;
    
    this.dom.exerciseTableBody.innerHTML = '';
    
    this.processedExercises.forEach((exercise, index) => {
      const row = document.createElement('tr');
      const blockClass = `b-${exercise.block.replace('_', '-')}`;
      row.className = blockClass;
      row.id = `exercise-row-${index}`;
      
      // Show only active work time, not setup time
      const workStartMinutes = Math.floor(exercise.workStartTime / 60);
      const workStartSeconds = exercise.workStartTime % 60;
      const workEndMinutes = Math.floor(exercise.endTime / 60);
      const workEndSeconds = exercise.endTime % 60;
      
      const timeString = `${workStartMinutes}:${workStartSeconds.toString().padStart(2, '0')}–${workEndMinutes}:${workEndSeconds.toString().padStart(2, '0')}`;
      
      row.innerHTML = `
        <td class="time">${timeString}</td>
        <td class="block">${exercise.blockName}</td>
        <td>${exercise.name}</td>
        <td>${exercise.work_s} s</td>
      `;
      
      this.dom.exerciseTableBody.appendChild(row);
    });
    
    // Re-applica evidenziazione riga corrente se attiva
    if (this.state.currentExerciseIndex >= 0) {
      const currentRow = document.getElementById(`exercise-row-${this.state.currentExerciseIndex}`);
      if (currentRow) {
        currentRow.classList.add('current-row');
      }
    }
  }

  start() {
    if (this.state.isRunning && !this.state.isPaused) return;
    
    if (!this.state.isRunning) {
      // Show countdown overlay like the old version
      this.showCountdown(() => {
        this.state.currentExerciseIndex = 0;
        this.state.totalElapsedSeconds = 0;
        this.state.exerciseElapsedSeconds = 0;
        this.state.currentPhase = 'exercise';
        this.state.isRunning = true;
        this.state.isPaused = false;
        this.updateButtonStates();
        this.startTimer();
        this.startCurrentExercise();
      });
      return;
    }
    
    this.state.isRunning = true;
    this.state.isPaused = false;
    
    this.updateButtonStates();
    this.startTimer();
  }

  pause() {
    if (!this.state.isRunning || this.state.isPaused) return;
    
    this.state.isPaused = true;
    this.stopTimer();
    this.updateButtonStates();
  }

  reset() {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.state.currentExerciseIndex = -1;
    this.state.totalElapsedSeconds = 0;
    this.state.exerciseElapsedSeconds = 0;
    this.state.currentPhase = 'ready';
    
    this.stopTimer();
    this.updateDisplay();
    this.updateButtonStates();
  }

  startTimer() {
    this.stopTimer();
    this.state.timer = setInterval(() => {
      this.tick();
    }, 1000);
  }

  stopTimer() {
    if (this.state.timer) {
      clearInterval(this.state.timer);
      this.state.timer = null;
    }
  }

  tick() {
    this.state.totalElapsedSeconds++;
    this.state.exerciseElapsedSeconds++;
    
    this.handlePhaseTransitions();
    this.updateDisplay();
    
    // Update exercise display dynamically (for setup/work phase changes)
    if (this.state.currentExerciseIndex >= 0 && this.state.currentExerciseIndex < this.processedExercises.length) {
      const currentExercise = this.processedExercises[this.state.currentExerciseIndex];
      this.updateExerciseDisplay(currentExercise);
    }
  }

  handlePhaseTransitions() {
    // Handle countdown phase
    if (this.state.currentPhase === 'countdown') {
      if (this.state.totalElapsedSeconds >= this.config.timing.config.countdown_s) {
        this.state.currentPhase = 'exercise';
        this.state.exerciseElapsedSeconds = 0;
        this.startCurrentExercise();
      }
      return;
    }

    // Handle exercise phases
    if (this.state.currentPhase === 'exercise') {
      const currentExercise = this.processedExercises[this.state.currentExerciseIndex];
      if (!currentExercise) return;

      // Check if we should show "up next" notification
      const timeInWork = this.state.exerciseElapsedSeconds - currentExercise.setup_s;
      const timeUntilEnd = currentExercise.work_s - timeInWork;
      
      if (timeUntilEnd === this.config.timing.config.up_next_notice_s) {
        this.showUpNext();
      }

      // Check if exercise is complete
      if (this.state.exerciseElapsedSeconds >= currentExercise.totalDuration) {
        this.completeCurrentExercise();
      }
    }
  }

  startCurrentExercise() {
    const currentExercise = this.processedExercises[this.state.currentExerciseIndex];
    if (!currentExercise) return;

    console.log(`Starting exercise ${currentExercise.n}: ${currentExercise.name}`);
    this.updateExerciseDisplay(currentExercise);
    this.playBeep();
  }

  completeCurrentExercise() {
    this.state.currentExerciseIndex++;
    this.state.exerciseElapsedSeconds = 0;

    // Check if workout is complete
    if (this.state.currentExerciseIndex >= this.processedExercises.length) {
      this.completeWorkout();
      return;
    }

    // Check if we need block rest
    const prevExercise = this.processedExercises[this.state.currentExerciseIndex - 1];
    const nextExercise = this.processedExercises[this.state.currentExerciseIndex];
    
    if (prevExercise.block !== nextExercise.block) {
      const blockRestSeconds = this.config.timing.config.block_rest_s[prevExercise.block] || 0;
      if (blockRestSeconds > 0) {
        this.startBlockRest(blockRestSeconds);
        return;
      }
    }

    // Continue to next exercise
    this.startCurrentExercise();
  }

  startBlockRest(restSeconds) {
    this.state.currentPhase = 'block_rest';
    this.state.blockRestRemaining = restSeconds;
    
    const ui = this.config.i18n.ui[this.state.currentLang];
    this.safeUpdateTextContent(this.dom.exerciseName, `Block Rest: ${restSeconds}s`);
    this.safeUpdateTextContent(this.dom.exerciseDescription, 'Prepare for next block');
    
    // Use a separate interval for block rest countdown
    const restTimer = setInterval(() => {
      this.state.blockRestRemaining--;
      this.safeUpdateTextContent(this.dom.exerciseName, `Block Rest: ${this.state.blockRestRemaining}s`);
      
      if (this.state.blockRestRemaining <= 0) {
        clearInterval(restTimer);
        this.state.currentPhase = 'exercise';
        this.startCurrentExercise();
      }
    }, 1000);
  }

  showUpNext() {
    const nextIndex = this.state.currentExerciseIndex + 1;
    if (nextIndex < this.processedExercises.length) {
      const nextExercise = this.processedExercises[nextIndex];
      const ui = this.config.i18n.ui[this.state.currentLang];
      
      if (this.dom.upNext) {
        this.dom.upNext.innerHTML = `<strong>${ui.upNext}</strong> ${this.escapeHtml(nextExercise.name)}`;
        this.dom.upNext.style.display = 'block';
      }
    }
  }

  updateExerciseDisplay(exercise) {
    this.safeUpdateTextContent(this.dom.exerciseName, exercise.name);
    this.safeUpdateTextContent(this.dom.exerciseBlock, exercise.blockName);
    this.safeUpdateTextContent(this.dom.exerciseIcon, exercise.icon);

    // Show setup hint if in setup phase
    if (this.state.exerciseElapsedSeconds < exercise.setup_s) {
      const ui = this.config.i18n.ui[this.state.currentLang];
      this.safeUpdateTextContent(this.dom.exerciseDescription, `${ui.setupExercise} ${exercise.setupHint}`);
      // Add setup styling
      if (this.dom.exerciseDescription) {
        this.dom.exerciseDescription.style.color = '#ff6b35';
        this.dom.exerciseDescription.style.fontWeight = 'bold';
      }
    } else {
      this.safeUpdateTextContent(this.dom.exerciseDescription, exercise.description);
      // Reset styling
      if (this.dom.exerciseDescription) {
        this.dom.exerciseDescription.style.color = '';
        this.dom.exerciseDescription.style.fontWeight = '';
      }
    }

    // Hide up next display
    if (this.dom.upNext) {
      this.dom.upNext.style.display = 'none';
    }
  }

  completeWorkout() {
    this.state.isRunning = false;
    this.state.currentPhase = 'complete';
    this.stopTimer();
    
    const ui = this.config.i18n.ui[this.state.currentLang];
    this.safeUpdateTextContent(this.dom.exerciseName, ui.congratsTitle);
    this.safeUpdateTextContent(this.dom.exerciseDescription, ui.congratsSubtitle);
    this.safeUpdateTextContent(this.dom.exerciseIcon, '🎉');
    
    this.updateButtonStates();
    this.playVictoryTune();
  }

  updateDisplay() {
    // Update timer display
    const elapsedMinutes = Math.floor(this.state.totalElapsedSeconds / 60);
    const elapsedSeconds = this.state.totalElapsedSeconds % 60;
    const totalMinutes = Math.floor(this.totalWorkoutSeconds / 60);
    const totalSeconds = this.totalWorkoutSeconds % 60;
    
    const elapsedTime = `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')}`;
    const totalTime = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
    const displayTime = `${elapsedTime} / ${totalTime}`;
    
    this.safeUpdateTextContent(this.dom.timerDisplay, displayTime);

    // Update progress bars
    if (this.dom.progressFill && this.dom.progressPercentage) {
      const totalProgress = Math.min((this.state.totalElapsedSeconds / this.totalWorkoutSeconds) * 100, 100);
      this.dom.progressFill.style.width = `${totalProgress}%`;
      this.safeUpdateTextContent(this.dom.progressPercentage, `${Math.round(totalProgress)}%`);
    }

    // Update exercise progress
    if (this.state.currentExerciseIndex >= 0 && this.state.currentExerciseIndex < this.processedExercises.length && this.state.isRunning) {
      const currentExercise = this.processedExercises[this.state.currentExerciseIndex];
      
      let exerciseProgress = 0;
      if (this.state.exerciseElapsedSeconds >= currentExercise.setup_s) {
        // Only show progress during work phase, not setup
        const timeInWork = this.state.exerciseElapsedSeconds - currentExercise.setup_s;
        exerciseProgress = Math.min((timeInWork / currentExercise.work_s) * 100, 100);
      }
      // During setup phase, progress stays at 0%
      
      if (this.dom.exerciseProgressFill && this.dom.exerciseProgressPercentage) {
        this.dom.exerciseProgressFill.style.width = `${exerciseProgress}%`;
        this.safeUpdateTextContent(this.dom.exerciseProgressPercentage, `${Math.round(exerciseProgress)}%`);
        
        // Show container if hidden
        if (this.dom.exerciseProgressContainer) {
          this.dom.exerciseProgressContainer.style.display = 'flex';
        }
      }
    } else {
      // Hide exercise progress when not in exercise
      if (this.dom.exerciseProgressContainer) {
        this.dom.exerciseProgressContainer.style.display = 'none';
      }
    }

    // Highlight current exercise in table
    this.highlightCurrentRow();
  }

  updateButtonStates() {
    const ui = this.config.i18n.ui[this.state.currentLang];
    // Play button visibilità: solo se non running o in pausa
    if (this.dom.playBtn) {
      if (!this.state.isRunning || this.state.isPaused) {
        this.dom.playBtn.style.display = 'block';
      } else {
        this.dom.playBtn.style.display = 'none';
      }
    }
    // Pause button visibilità: solo se running e non in pausa
    if (this.dom.pauseBtn) {
      if (this.state.isRunning && !this.state.isPaused) {
        this.dom.pauseBtn.style.display = 'block';
        this.dom.pauseBtn.removeAttribute('disabled');
      } else {
        this.dom.pauseBtn.style.display = 'none';
        this.dom.pauseBtn.setAttribute('disabled', '');
      }
    }
    this.updateButtonText(this.dom.playBtn, this.state.isPaused ? ui.resumeBtn : ui.startBtn);
  }

  showCountdown(callback) {
    const overlay = document.createElement('div');
    overlay.className = 'countdown-overlay';
    
    const countdownNumber = document.createElement('div');
    countdownNumber.className = 'countdown-number';
    overlay.appendChild(countdownNumber);
    
    if (!document.body) {
      console.error('Document body not available');
      callback();
      return;
    }
    
    document.body.appendChild(overlay);
    
    let count = this.config.timing.config.countdown_s;
    countdownNumber.textContent = count;
    
    const countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownNumber.textContent = count;
        this.playBeep();
      } else {
        const ui = this.config.i18n.ui[this.state.currentLang];
        countdownNumber.textContent = ui.goText;
        this.playBeep();
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
          callback();
        }, 500);
        clearInterval(countdownTimer);
      }
    }, 1000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  highlightCurrentRow() {
    // Remove previous highlight
    document.querySelectorAll('[id^="exercise-row-"]').forEach(row => {
      row.classList.remove('current-row');
    });
    
    // Add current highlight
    if (this.state.currentExerciseIndex >= 0) {
      const currentRow = document.getElementById(`exercise-row-${this.state.currentExerciseIndex}`);
      if (currentRow) {
        currentRow.classList.add('current-row');
        
        // Scroll to current row
        currentRow.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }

  playVictoryTune() {
    if (!this.state.audioContext) return;
    
    try {
      const notes = [
        {freq: 523.25, duration: 0.4}, // C5
        {freq: 587.33, duration: 0.4}, // D5
        {freq: 659.25, duration: 0.4}, // E5
        {freq: 698.46, duration: 0.6}, // F5
        {freq: 659.25, duration: 0.3}, // E5
        {freq: 587.33, duration: 0.3}, // D5
        {freq: 523.25, duration: 0.8}, // C5
      ];
      
      let currentTime = this.state.audioContext.currentTime;
      
      notes.forEach(note => {
        const oscillator = this.state.audioContext.createOscillator();
        const gainNode = this.state.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.state.audioContext.destination);
        
        oscillator.frequency.value = note.freq;
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0.3, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration);
        
        currentTime += note.duration;
      });
    } catch (e) {
      console.log('Error playing victory tune:', e);
    }
  }

  static switchTab(tabIndex) {
    const tabContents = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabContents.forEach((content, index) => {
      content.classList.toggle('active', index === tabIndex);
    });
    
    tabButtons.forEach((button, index) => {
      button.classList.toggle('active', index === tabIndex);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  WorkoutTimer.instance = new WorkoutTimer();
  
  // Make switchTab globally available for onclick handlers
  window.switchTab = WorkoutTimer.switchTab;
});