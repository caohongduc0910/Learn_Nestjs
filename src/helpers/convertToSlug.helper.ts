import slugify from 'slugify';

const convertToSlug = (text: string): string => {
  return slugify(text.trim(), { lower: true });
};

export default convertToSlug;
