export default function imagePath(path) {
  if (!path) {
    return '';
  }

  if (path.startsWith('http')) {
    return path;
  } else if (path.includes('data:image')) {
    return path;
  } else {
    path = process.env.REACT_APP_BASE_API + '/' + path;
    return path;
  }
}
