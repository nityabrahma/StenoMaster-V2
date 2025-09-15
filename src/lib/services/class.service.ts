
import { db } from '@/lib/data-store';
import type { Class } from '@/lib/types';

export async function getAllClasses(): Promise<Class[]> {
    return new Promise(resolve => resolve(db.read<Class>('classes')));
}

export async function createClass(data: Omit<Class, 'id'>): Promise<Class> {
    const classes = await getAllClasses();
    const newClass: Class = {
        ...data,
        id: `class-${Date.now()}`,
    };
    db.write('classes', [...classes, newClass]);
    return new Promise(resolve => resolve(newClass));
}

export async function updateClass(id: string, data: Partial<Omit<Class, 'id'>>): Promise<Class> {
    const classes = await getAllClasses();
    const classIndex = classes.findIndex(c => c.id === id);

    if (classIndex === -1) {
        throw new Error('Class not found');
    }

    const updatedClass = { ...classes[classIndex], ...data } as Class;
    classes[classIndex] = updatedClass;
    db.write('classes', classes);

    return new Promise(resolve => resolve(updatedClass));
}
