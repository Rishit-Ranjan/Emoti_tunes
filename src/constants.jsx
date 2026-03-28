import { HappyIcon, SadIcon, AngryIcon, JoyfulIcon, MelancholyIcon, EnergeticIcon } from './components/icons/EmotionIcons';
export const EMOTIONS = [
    {
        name: 'Joy',
        description: 'Feeling upbeat and happy.',
        icon: HappyIcon,
        color: 'text-yellow-300',
        gradient: 'from-yellow-500/10 to-[#0a0a12]',
        recommendations: ['Walking on Sunshine', 'Happy', 'Good Vibrations']
    },
    {
        name: 'Sadness',
        description: 'For quiet, reflective moments.',
        icon: SadIcon,
        color: 'text-blue-300',
        gradient: 'from-blue-500/10 to-[#0a0a12]',
        recommendations: ['Someone Like You', 'Fix You', 'Yesterday']
    },
    {
        name: 'Anger',
        description: 'To channel your frustration.',
        icon: AngryIcon,
        color: 'text-red-400',
        gradient: 'from-red-500/10 to-[#0a0a12]',
        recommendations: ['Break Stuff', 'Killing In The Name', 'Bulls On Parade']
    },
    {
        name: 'Excitement',
        description: 'High-energy and thrilling.',
        icon: JoyfulIcon,
        color: 'text-orange-400',
        gradient: 'from-orange-500/10 to-[#0a0a12]',
        recommendations: ["Can't Stop", 'Thunderstruck', 'Mr. Brightside']
    },
    {
        name: 'Melancholy',
        description: 'Bittersweet and thoughtful.',
        icon: MelancholyIcon,
        color: 'text-indigo-300',
        gradient: 'from-indigo-500/10 to-[#0a0a12]',
        recommendations: ['Creep', 'Hurt', 'The Night We Met']
    },
    {
        name: 'Peaceful',
        description: 'Calm, serene, and relaxing.',
        icon: EnergeticIcon,
        color: 'text-green-300',
        gradient: 'from-green-500/10 to-[#0a0a12]',
        recommendations: ['Weightless', 'River Flows In You', 'Claire de Lune']
    },
    {
        name: 'Joy-Anger',
        description: 'Triumphant, righteous fury.',
        icon: AngryIcon,
        color: 'text-orange-400',
        gradient: 'from-orange-500/10 to-[#0a0a12]',
        recommendations: ['Power', 'Survivor', 'Eye of the Tiger']
    },
    {
        name: 'Joy-Surprise',
        description: 'Delightful astonishment.',
        icon: JoyfulIcon,
        color: 'text-pink-400',
        gradient: 'from-pink-500/10 to-[#0a0a12]',
        recommendations: ['September', 'Uptown Funk', 'Sugar']
    },
    {
        name: 'Joy-Excitement',
        description: 'Bursting with positive energy.',
        icon: HappyIcon,
        color: 'text-lime-300',
        gradient: 'from-lime-500/10 to-[#0a0a12]',
        recommendations: ['Levitating', 'Shut Up and Dance', 'Shake It Off']
    },
    {
        name: 'Sad-Anger',
        description: 'Frustrated and feeling down.',
        icon: SadIcon,
        color: 'text-purple-400',
        gradient: 'from-purple-500/10 to-[#0a0a12]',
        recommendations: ['In the End', 'Numb', 'Liability']
    }
];
