import React from 'react';
import NextLink, { LinkProps } from 'next/link';

const Link: React.FC<LinkProps> = (props) => <NextLink {...props} />;

export { Link };
