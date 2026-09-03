import { Schema, model, models, Document, Types } from 'mongoose';
import Event from './event.model';

// TypeScript interface for Booking document
export interface IBooking extends Document {
    eventId: Types.ObjectId;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event ID is required'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            validate: {
                validator: function (email: string) {
                    // RFC 5322 compliant email validation regex
                    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                    return emailRegex.test(email);
                },
                message: 'Please provide a valid email address',
            },
        },
    },
    {
        timestamps: true, // Auto-generate createdAt and updatedAt
    }
);

// Pre-save hook to validate event exists before creating booking.
// Depuis Mongoose 9, plus de callback `next` : la fonction async attend
// naturellement la promesse, et un `throw` bloque la sauvegarde.
BookingSchema.pre('save', async function (this: IBooking) {
    // Only validate eventId if it's new or modified
    if (this.isModified('eventId') || this.isNew) {
        let eventExists;

        try {
            eventExists = await Event.findById(this.eventId).select('_id');
        } catch {
            throw new Error('Invalid event ID format or database error');
        }

        if (!eventExists) {
            throw new Error(`Event with ID ${this.eventId} does not exist`);
        }
    }
});

// Create index on eventId for faster queries
BookingSchema.index({ eventId: 1 });

// Create compound index for common queries (event bookings by date)
BookingSchema.index({ eventId: 1, createdAt: -1 });

// Create index on email for user booking lookups
BookingSchema.index({ email: 1 });

// Enforce one booking per event per email
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true, name: 'uniq_event_email' });

const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;