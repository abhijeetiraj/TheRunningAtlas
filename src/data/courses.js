// The Course fly-over's courses. They are made up (claim C5): each has a route shape (control points, scaled so the
// route is the right length) and an elevation profile (control points in km and metres, smoothed between them).
// `time` is the default finishing time in seconds.

export const COURSES = [
  {
    id: 'flat10', name: 'Riverside 10K', short: 'Flat 10K', km: 10, time: 55 * 60,
    blurb: 'A loop beside a river: almost flat, so even effort and even pace are nearly the same thing.',
    route: [[0, 0], [1.3, 0.2], [2.4, 0.9], [2.9, 2.1], [2.5, 3.2], [1.4, 3.7], [0.3, 3.3], [-0.4, 2.3], [-0.5, 1.2], [-0.2, 0.3]],
    elev: [[0, 12], [1.5, 14], [3, 11], [4.5, 15], [6, 12], [7.5, 16], [9, 13], [10, 12]],
  },
  {
    id: 'rolling', name: 'Rolling Hills Half', short: 'Rolling half', km: 21.0975, time: 2 * 3600,
    blurb: 'A half marathon over steady rolling hills: the plan eases off on the climbs and makes some of it back on the way down.',
    route: [[0, 0], [1.5, -0.6], [3.2, -0.2], [4.6, 1.0], [5.0, 2.7], [4.1, 4.1], [2.4, 4.7], [0.8, 4.2], [-0.4, 3.0], [-1.6, 3.6], [-2.8, 2.8], [-2.9, 1.4], [-1.9, 0.4], [-0.8, 0.1]],
    elev: [[0, 40], [2, 58], [3.5, 45], [5, 70], [7, 52], [9, 80], [11, 60], [13, 86], [15, 62], [17, 74], [19, 50], [21.1, 42]],
  },
  {
    id: 'late', name: 'Late Hills Marathon', short: 'Hilly marathon', km: 42.195, time: 4 * 3600 + 15 * 60,
    blurb: 'A marathon that saves its hills for the second half, when your legs are tired. The plan keeps something back for them.',
    route: [[0, 0], [2.5, -1.0], [5.5, -0.8], [8.0, 0.6], [9.0, 3.0], [8.2, 5.6], [6.0, 7.2], [3.2, 7.8], [0.6, 7.0], [-1.2, 5.4], [-1.6, 3.4], [-3.2, 2.6], [-4.4, 4.0], [-4.0, 6.0], [-5.2, 7.2], [-6.6, 6.0], [-6.4, 3.4], [-5.0, 1.0], [-2.6, 0.2]],
    elev: [[0, 20], [5, 28], [10, 22], [15, 30], [20, 26], [24, 34], [26, 60], [27.5, 48], [29, 78], [30.5, 62], [32, 96], [33.5, 72], [36, 46], [39, 30], [42.2, 22]],
  },
];
