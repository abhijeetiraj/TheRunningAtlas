// The Injury body map: areas where common running injuries are usually felt. Each area has markers on the 3D runner
// (a bone of the figure and an offset in that bone's own space, in metres; +x is the figure's left, +z its front),
// the muscles lit for context, and a camera view. The left leg (+1) carries the markers.
// The map is for reading about injuries, not for working out what is causing someone's pain: see claim I4.
const PI = Math.PI;

export const AREAS = [
  {
    id: 'knee-front', name: 'Front of the knee', topic: 'injuries-health/runners-knee', injury: "Runner's knee (patellofemoral pain)",
    markers: [{ bone: 'shin', x: 0, y: 0.0, z: 0.06 }],
    lit: { quadsL: 0.8 }, cam: { az: 0.45, el: 0.08, dist: 2.6, target: [0.05, 0.5, 0] },
  },
  {
    id: 'knee-outer', name: 'Outer knee', topic: 'injuries-health/outer-knee-itb', injury: 'Iliotibial band (ITB) pain',
    markers: [{ bone: 'shin', x: 0.058, y: 0.02, z: 0.0 }],
    lit: { abductorsL: 0.6 }, cam: { az: 1.15, el: 0.08, dist: 2.7, target: [0.08, 0.55, 0] },
  },
  {
    id: 'shin', name: 'Inner shin', topic: 'injuries-health/shin-pain', injury: 'Shin splints (medial tibial stress syndrome)',
    markers: [{ bone: 'shin', x: -0.032, y: -0.22, z: 0.012 }, { bone: 'shin', x: -0.03, y: -0.3, z: 0.006 }],
    lit: { calvesL: 0.5 }, cam: { az: -0.55, el: 0.05, dist: 2.4, target: [0.08, 0.35, 0] },
  },
  {
    id: 'achilles', name: 'Back of the ankle', topic: 'injuries-health/achilles-pain', injury: 'Achilles tendon pain',
    markers: [{ bone: 'shin', x: 0, y: -0.35, z: -0.045 }],
    lit: { calvesL: 0.6, achillesL: 1 }, cam: { az: PI - 0.6, el: 0.12, dist: 2.3, target: [0.08, 0.3, 0] },
  },
  {
    id: 'heel', name: 'Under the heel', topic: 'injuries-health/heel-pain', injury: 'Plantar heel pain (plantar fasciitis)',
    markers: [{ bone: 'foot', x: 0, y: -0.06, z: -0.035 }, { bone: 'foot', x: 0, y: -0.056, z: 0.03 }],
    lit: {}, cam: { az: PI / 2 + 0.35, el: 0.22, dist: 1.8, target: [0.08, 0.1, 0.02] },
  },
  {
    id: 'bone', name: 'A spot on a bone', topic: 'injuries-health/bone-stress', injury: 'Bone stress injuries',
    markers: [
      { bone: 'shin', x: 0.0, y: -0.2, z: 0.042 },    // front of the shin bone
      { bone: 'foot', x: 0.0, y: -0.025, z: 0.1 },    // top of the foot (metatarsals)
      { bone: 'hip', x: -0.03, y: -0.03, z: 0.06 },   // front of the hip and groin (femoral neck)
    ],
    lit: {}, cam: { az: 0.6, el: 0.1, dist: 3.4, target: [0.05, 0.6, 0] },
  },
];
