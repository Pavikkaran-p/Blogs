import { Hono } from 'hono';
import { cors } from 'hono/cors'
import {userRouter} from './routes/auth';
import { blogRouter } from './routes/blog';

const app = new Hono<{
	Bindings:{
		DATABASE_URL: string,
		JWT_SECRET:string
	}
}>();

// app.options('*', (c) => c.text('CORS is enabled', 204));

// app.use('*', (c, next) => {
//     c.header('Access-Control-Allow-Origin', 'http://localhost:5173');
//     c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     c.header('Access-Control-Allow-Credentials', 'true'); // Allow cookies to be sent
//     return next();
// });

app.use(cors({
	origin: 'http://localhost:5173', 
	credentials: true,
  }));
app.get('/',(c)=>{
	return c.text("Backend up!!")
})
app.route('/api/v1/user/',userRouter)
app.route("/api/v1/blog/",blogRouter)




export default app;