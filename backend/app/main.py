import database as _db
import fastapi as _fa
import fastapi.middleware.cors as _fmc
import routes.record as _rr
import routes.stats as _sr


# Create app instance
app = _fa.FastAPI(lifespan=_db.lifespan)

# Include all routers
app.include_router(_rr.router)
app.include_router(_sr.router)


# Add CORS middleware
origins = ["http://localhost:3000"]

app.add_middleware(
    _fmc.CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
