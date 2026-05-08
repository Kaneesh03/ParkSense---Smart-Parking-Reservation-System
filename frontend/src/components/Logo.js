import React from 'react';

/**
 * Reusable Logo component - renders the ParkSense logo image.
 * Logo.png must be placed in frontend/public/Logo.png
 */
export default function Logo({ height = 40, style = {} }) {
    return (
        <img
            src={process.env.PUBLIC_URL + '/Logo.png'}
            alt="ParkSense"
            height={height}
            style={{ objectFit: 'contain', display: 'block', ...style }}
        />
    );
}
