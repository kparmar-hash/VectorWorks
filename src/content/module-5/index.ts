import {type Module} from '../../types/curriculum'
import {lesson01} from './lessons/01-projectile-motion'
import {lesson02} from './lessons/02-exit-velocity-wheel-speed'
import {lesson03} from './lessons/03-flywheel-energy'
import {lesson04} from './lessons/04-shooter-tuning'


export const module5: Module = {
    id: 'module-5-launchers-shooters',
    title: 'Launchers & Shooters',
    shortTitle: 'Shooters',
    description: 'The math behind how shooters are programmed, from physics to actual hardware',
    order: 5,
    color: 'red',
    lessons: [lesson01, lesson02, lesson03, lesson04]
}