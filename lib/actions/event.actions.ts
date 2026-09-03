'use server';

import Event from '@/database/event.model';
import connectDB from '@/lib/mongodb';

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug });

        if (!event) return [];

        console.log('event.tags:', event.tags);

        const allOthers = await Event.find({ _id: { $ne: event._id } }).select('title tags').lean();
        console.log('other events tags:', allOthers); // ← ajoute cette ligne


        return await Event.find({
            _id: { $ne: event._id },
            tags: { $in: event.tags },
        }).lean();
    } catch {
        return [];
    }
}