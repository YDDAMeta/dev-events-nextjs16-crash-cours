'use client';

import { useState } from 'react';
import { createBooking } from '@/lib/actions/booking.action';
import posthog from 'posthog-js';

interface BookEventProps {
    eventId: string;
    slug: string;
}

const BookEvent = ({ eventId, slug }: BookEventProps) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await createBooking({ eventId, slug, email });
            setSubmitted(true);
            if(
                process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
                process.env.NEXT_PUBLIC_POSTHOG_HOST
            ){
                posthog.capture('event_booked', {
                    event_id: eventId,
                    event_slug: slug,
                });

            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank you for signing up!</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            required
                            placeholder="Enter email address"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button type="submit" className="button-submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default BookEvent;