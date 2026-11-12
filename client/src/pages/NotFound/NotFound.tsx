import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-sm text-muted-foreground">页面不存在</p>
      <Link className="text-sm underline underline-offset-4" to="/">
        返回首页
      </Link>
    </div>
  );
};

export default NotFound;
