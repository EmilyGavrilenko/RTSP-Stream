### Setup
1. Add a .env file inside the `frontend`, `backend`, and `inference_code` directories
2. Inside the frontend file, add values for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Inside the backend file, add the same values for `SUPABASE_URL` and `SUPABASE_KEY`
4. Inside the inference_code file, add values for `SUPABASE_URL`, `SUPABASE_KEY`, `ROBOFLOW_API_KEY` and `RTSP_URL`.
   - Here's a [link to the workflow](https://app.roboflow.com/roboflow-emily/workflows/edit/rtsp-stream-sf) and the [shareable workflow url](https://app.roboflow.com/workflows/embed/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3b3JrZmxvd0lkIjoiT0pRdEdrQ3N4SUVoZXgxOGYzcm4iLCJ3b3Jrc3BhY2VJZCI6IkltRkxJWlNrR2JOeTl6YjRVdXFsTXpQUnBwUTIiLCJ1c2VySWQiOiJJbUZMSVpTa0diTnk5emI0VXVxbE16UFJwcFEyIiwiaWF0IjoxNzQxMzAyNDQ0fQ.rZ3Ntd9cqCHlvwYHY2-eh80tw1ir2YhTYQT-Cb19sfc) to get the workflow data

### Running the frontend
`cd frontend && npm i && npm run dev`

### Running the backend
`cd backend && nodemon server.js`

### Running the inference server

First, install inference
`pip install inference`

Then, start the python script
`cd inference_code && python rtsp_stream.py`

 
