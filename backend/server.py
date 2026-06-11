from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "comman-school-dev-secret-CHANGE-ME-prod-xyz789")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

ADMIN_EMAIL = "Praveenrajeshpurohit@gmail.com"
ADMIN_PASSWORD = "Praveen@5187"
TEACHER_NAME = "Praveen Pareek"
SUPPORT_NUMBER = "8401094966"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

app = FastAPI(title="Comman School LMS API")
api_router = APIRouter(prefix="/api")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(p: str) -> str:
    return pwd_context.hash(p)


def verify_password(p: str, h: str) -> bool:
    try:
        return pwd_context.verify(p, h)
    except Exception:
        return False


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


# ============================== MODELS ==============================
class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: Literal["student", "admin"]
    created_at: datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=2, max_length=80)
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class Course(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    thumbnail: Optional[str] = None  # base64 or URL
    price: float = 0.0
    discount_price: Optional[float] = None
    validity_days: int = 365
    is_free: bool = False
    is_enrollable: bool = True
    instructor: str = TEACHER_NAME
    duration: Optional[str] = None
    level: Optional[str] = "Beginner"
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    thumbnail: Optional[str] = None
    price: float = 0.0
    discount_price: Optional[float] = None
    validity_days: int = 365
    is_free: bool = False
    is_enrollable: bool = True
    duration: Optional[str] = None
    level: Optional[str] = "Beginner"


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    thumbnail: Optional[str] = None
    price: Optional[float] = None
    discount_price: Optional[float] = None
    validity_days: Optional[int] = None
    is_free: Optional[bool] = None
    is_enrollable: Optional[bool] = None
    duration: Optional[str] = None
    level: Optional[str] = None


class Enrollment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    course_id: str
    status: Literal["active", "expired", "revoked"] = "active"
    progress: float = 0.0  # 0..100
    enrolled_at: datetime = Field(default_factory=utcnow)
    expires_at: Optional[datetime] = None


class Payment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    user_name: str
    course_id: str
    course_title: str
    amount: float
    screenshot: Optional[str] = None  # base64
    upi_ref: Optional[str] = None
    status: Literal["pending", "approved", "rejected"] = "pending"
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)
    reviewed_at: Optional[datetime] = None


class PaymentCreate(BaseModel):
    course_id: str
    screenshot: Optional[str] = None
    upi_ref: Optional[str] = None


class PaymentDecision(BaseModel):
    status: Literal["approved", "rejected"]
    note: Optional[str] = None


class ContentItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: str
    title: str
    type: Literal["video", "pdf", "assignment"]
    data: Optional[str] = None  # base64
    url: Optional[str] = None  # alternate (e.g., youtube link)
    description: Optional[str] = None
    order: int = 0
    duration: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)


class ContentCreate(BaseModel):
    course_id: str
    title: str
    type: Literal["video", "pdf", "assignment"]
    data: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    order: int = 0
    duration: Optional[str] = None


class LiveClass(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: Optional[str] = None  # None = general class
    title: str
    description: Optional[str] = None
    join_url: str
    scheduled_at: datetime
    duration_min: int = 60
    created_at: datetime = Field(default_factory=utcnow)


class LiveClassCreate(BaseModel):
    course_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    join_url: str
    scheduled_at: datetime
    duration_min: int = 60


class Settings(BaseModel):
    upi_id: str = "praveen@upi"
    upi_qr: Optional[str] = None  # base64
    whatsapp_number: str = SUPPORT_NUMBER
    support_email: str = ADMIN_EMAIL
    support_phone: str = SUPPORT_NUMBER
    teacher_bio: str = (
        f"{TEACHER_NAME} is an experienced educator with 10+ years of "
        "teaching Gujarat Board English Medium students. Passionate about "
        "making complex topics simple and accessible to every learner."
    )
    teacher_image: Optional[str] = None
    teacher_qualifications: str = "M.Sc, B.Ed, 10+ Years Teaching"
    hero_title: str = "Learn Anytime, Anywhere"
    hero_subtitle: str = "Live & recorded classes for Gujarat Board English Medium students"


class SettingsUpdate(BaseModel):
    upi_id: Optional[str] = None
    upi_qr: Optional[str] = None
    whatsapp_number: Optional[str] = None
    support_email: Optional[str] = None
    support_phone: Optional[str] = None
    teacher_bio: Optional[str] = None
    teacher_image: Optional[str] = None
    teacher_qualifications: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None


class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    message: str
    target: Literal["all", "user"] = "all"
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)
    read_by: List[str] = []


class NotificationCreate(BaseModel):
    title: str
    message: str
    target: Literal["all", "user"] = "all"
    user_id: Optional[str] = None


class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str = "Student"
    quote: str
    rating: int = 5
    avatar: Optional[str] = None


class FAQ(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    order: int = 0


class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=utcnow)


class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str


# ============================== HELPERS ==============================
def _strip_id(doc: dict) -> dict:
    if doc is None:
        return doc
    doc.pop("_id", None)
    return doc


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ============================== AUTH ==============================
@api_router.post("/auth/register", response_model=TokenResponse, status_code=201)
async def register(body: UserRegister):
    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": body.email.lower(),
        "password": hash_password(body.password),
        "name": body.name,
        "phone": body.phone,
        "role": "student",
        "created_at": utcnow(),
    }
    await db.users.insert_one(doc)
    public = UserPublic(
        id=user_id, email=body.email.lower(), name=body.name, phone=body.phone,
        role="student", created_at=doc["created_at"],
    )
    token = create_access_token({"sub": user_id, "role": "student"})
    return TokenResponse(access_token=token, user=public)


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(body: UserLogin):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    public = UserPublic(
        id=user["id"], email=user["email"], name=user["name"],
        phone=user.get("phone"), role=user["role"], created_at=user["created_at"],
    )
    token = create_access_token({"sub": user["id"], "role": user["role"]})
    return TokenResponse(access_token=token, user=public)


@api_router.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return UserPublic(**{k: user[k] for k in ["id", "email", "name", "role", "created_at"]}, phone=user.get("phone"))


# ============================== COURSES ==============================
@api_router.get("/courses", response_model=List[Course])
async def list_courses(category: Optional[str] = None, search: Optional[str] = None):
    q = {}
    if category and category.lower() != "all":
        q["category"] = category
    if search:
        q["title"] = {"$regex": search, "$options": "i"}
    docs = await db.courses.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [Course(**d) for d in docs]


@api_router.get("/courses/categories")
async def course_categories():
    cats = await db.courses.distinct("category")
    return {"categories": sorted(cats)}


@api_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    doc = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course(**doc)


@api_router.post("/courses", response_model=Course, status_code=201)
async def create_course(body: CourseCreate, admin=Depends(get_admin)):
    course = Course(**body.model_dump())
    await db.courses.insert_one(course.model_dump())
    return course


@api_router.put("/courses/{course_id}", response_model=Course)
async def update_course(course_id: str, body: CourseUpdate, admin=Depends(get_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    update["updated_at"] = utcnow()
    res = await db.courses.find_one_and_update(
        {"id": course_id}, {"$set": update}, return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course(**_strip_id(res))


@api_router.delete("/courses/{course_id}")
async def delete_course(course_id: str, admin=Depends(get_admin)):
    res = await db.courses.delete_one({"id": course_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    # cascade clean enrollments/content/payments? Keep content for history but remove enrollments
    await db.enrollments.delete_many({"course_id": course_id})
    await db.content.delete_many({"course_id": course_id})
    await db.live_classes.delete_many({"course_id": course_id})
    return {"ok": True}


# ============================== ENROLLMENTS ==============================
@api_router.get("/enrollments/my", response_model=List[Enrollment])
async def my_enrollments(user=Depends(get_current_user)):
    docs = await db.enrollments.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    return [Enrollment(**d) for d in docs]


@api_router.get("/enrollments/check/{course_id}")
async def check_enrolled(course_id: str, user=Depends(get_current_user)):
    if user.get("role") == "admin":
        return {"enrolled": True, "admin": True}
    e = await db.enrollments.find_one({"user_id": user["id"], "course_id": course_id, "status": "active"})
    return {"enrolled": bool(e)}


@api_router.post("/enrollments/grant")
async def grant_enrollment(user_id: str, course_id: str, admin=Depends(get_admin)):
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(404, "Course not found")
    target = await db.users.find_one({"id": user_id})
    if not target:
        raise HTTPException(404, "User not found")
    existing = await db.enrollments.find_one({"user_id": user_id, "course_id": course_id})
    if existing:
        await db.enrollments.update_one(
            {"id": existing["id"]}, {"$set": {"status": "active"}}
        )
        return {"ok": True, "id": existing["id"]}
    enr = Enrollment(
        user_id=user_id, course_id=course_id,
        expires_at=utcnow() + timedelta(days=course.get("validity_days", 365)),
    )
    await db.enrollments.insert_one(enr.model_dump())
    return {"ok": True, "id": enr.id}


# ============================== PAYMENTS ==============================
@api_router.post("/payments", response_model=Payment, status_code=201)
async def create_payment(body: PaymentCreate, user=Depends(get_current_user)):
    course = await db.courses.find_one({"id": body.course_id})
    if not course:
        raise HTTPException(404, "Course not found")
    amount = course.get("discount_price") or course.get("price", 0)
    if course.get("is_free") or amount == 0:
        # auto-enroll, no payment
        existing = await db.enrollments.find_one({"user_id": user["id"], "course_id": body.course_id})
        if not existing:
            enr = Enrollment(
                user_id=user["id"], course_id=body.course_id,
                expires_at=utcnow() + timedelta(days=course.get("validity_days", 365)),
            )
            await db.enrollments.insert_one(enr.model_dump())
        payment = Payment(
            user_id=user["id"], user_email=user["email"], user_name=user["name"],
            course_id=body.course_id, course_title=course["title"], amount=0,
            status="approved", reviewed_at=utcnow(),
        )
        await db.payments.insert_one(payment.model_dump())
        return payment
    payment = Payment(
        user_id=user["id"], user_email=user["email"], user_name=user["name"],
        course_id=body.course_id, course_title=course["title"],
        amount=amount, screenshot=body.screenshot, upi_ref=body.upi_ref,
    )
    await db.payments.insert_one(payment.model_dump())
    return payment


@api_router.get("/payments/my", response_model=List[Payment])
async def my_payments(user=Depends(get_current_user)):
    docs = await db.payments.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [Payment(**d) for d in docs]


@api_router.get("/payments", response_model=List[Payment])
async def list_payments(status: Optional[str] = None, admin=Depends(get_admin)):
    q = {}
    if status:
        q["status"] = status
    docs = await db.payments.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [Payment(**d) for d in docs]


@api_router.post("/payments/{payment_id}/decision", response_model=Payment)
async def decide_payment(payment_id: str, body: PaymentDecision, admin=Depends(get_admin)):
    payment = await db.payments.find_one({"id": payment_id})
    if not payment:
        raise HTTPException(404, "Payment not found")
    if payment["status"] != "pending":
        raise HTTPException(400, "Payment already reviewed")
    updated = {"status": body.status, "note": body.note, "reviewed_at": utcnow()}
    await db.payments.update_one({"id": payment_id}, {"$set": updated})
    # if approved -> enrollment
    if body.status == "approved":
        course = await db.courses.find_one({"id": payment["course_id"]})
        existing = await db.enrollments.find_one(
            {"user_id": payment["user_id"], "course_id": payment["course_id"]}
        )
        if not existing:
            enr = Enrollment(
                user_id=payment["user_id"], course_id=payment["course_id"],
                expires_at=utcnow() + timedelta(days=(course or {}).get("validity_days", 365)),
            )
            await db.enrollments.insert_one(enr.model_dump())
        else:
            await db.enrollments.update_one({"id": existing["id"]}, {"$set": {"status": "active"}})
    final = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    return Payment(**final)


# ============================== CONTENT (videos/PDFs/assignments) ==============================
@api_router.get("/courses/{course_id}/content", response_model=List[ContentItem])
async def list_content(course_id: str, user=Depends(get_current_user)):
    if user.get("role") != "admin":
        enr = await db.enrollments.find_one({"user_id": user["id"], "course_id": course_id, "status": "active"})
        if not enr:
            raise HTTPException(403, "Enroll to access course content")
    docs = await db.content.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(500)
    return [ContentItem(**d) for d in docs]


@api_router.post("/courses/{course_id}/content", response_model=ContentItem, status_code=201)
async def add_content(course_id: str, body: ContentCreate, admin=Depends(get_admin)):
    if body.course_id != course_id:
        body.course_id = course_id
    item = ContentItem(**body.model_dump())
    await db.content.insert_one(item.model_dump())
    return item


@api_router.delete("/content/{content_id}")
async def delete_content(content_id: str, admin=Depends(get_admin)):
    res = await db.content.delete_one({"id": content_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# ============================== LIVE CLASSES ==============================
@api_router.get("/live", response_model=List[LiveClass])
async def list_live(user=Depends(get_current_user)):
    if user.get("role") == "admin":
        docs = await db.live_classes.find({}, {"_id": 0}).sort("scheduled_at", 1).to_list(500)
    else:
        my_enrolls = await db.enrollments.find(
            {"user_id": user["id"], "status": "active"}, {"_id": 0, "course_id": 1}
        ).to_list(500)
        course_ids = [e["course_id"] for e in my_enrolls]
        docs = await db.live_classes.find(
            {"$or": [{"course_id": {"$in": course_ids}}, {"course_id": None}]},
            {"_id": 0},
        ).sort("scheduled_at", 1).to_list(500)
    return [LiveClass(**d) for d in docs]


@api_router.post("/live", response_model=LiveClass, status_code=201)
async def create_live(body: LiveClassCreate, admin=Depends(get_admin)):
    item = LiveClass(**body.model_dump())
    await db.live_classes.insert_one(item.model_dump())
    return item


@api_router.delete("/live/{live_id}")
async def delete_live(live_id: str, admin=Depends(get_admin)):
    res = await db.live_classes.delete_one({"id": live_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# ============================== SETTINGS ==============================
@api_router.get("/settings", response_model=Settings)
async def get_settings():
    doc = await db.settings.find_one({"key": "global"}, {"_id": 0, "key": 0})
    if not doc:
        s = Settings()
        await db.settings.insert_one({"key": "global", **s.model_dump()})
        return s
    return Settings(**doc)


@api_router.put("/settings", response_model=Settings)
async def update_settings(body: SettingsUpdate, admin=Depends(get_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update:
        return await get_settings()
    await db.settings.update_one({"key": "global"}, {"$set": update}, upsert=True)
    doc = await db.settings.find_one({"key": "global"}, {"_id": 0, "key": 0})
    return Settings(**doc)


# ============================== TESTIMONIALS & FAQ ==============================
@api_router.get("/testimonials", response_model=List[Testimonial])
async def list_testimonials():
    docs = await db.testimonials.find({}, {"_id": 0}).to_list(100)
    return [Testimonial(**d) for d in docs]


@api_router.get("/faqs", response_model=List[FAQ])
async def list_faqs():
    docs = await db.faqs.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return [FAQ(**d) for d in docs]


# ============================== ADMIN: USERS & STATS ==============================
@api_router.get("/admin/users", response_model=List[UserPublic])
async def list_users(admin=Depends(get_admin)):
    docs = await db.users.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(1000)
    return [UserPublic(**d) for d in docs]


@api_router.get("/admin/stats")
async def admin_stats(admin=Depends(get_admin)):
    students_n = await db.users.count_documents({"role": "student"})
    courses_n = await db.courses.count_documents({})
    enrollments_n = await db.enrollments.count_documents({"status": "active"})
    pending_payments = await db.payments.count_documents({"status": "pending"})
    approved = await db.payments.aggregate(
        [{"$match": {"status": "approved"}}, {"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    ).to_list(1)
    revenue = approved[0]["total"] if approved else 0
    return {
        "students": students_n,
        "courses": courses_n,
        "enrollments": enrollments_n,
        "pending_payments": pending_payments,
        "total_revenue": revenue,
    }


# ============================== NOTIFICATIONS ==============================
@api_router.get("/notifications", response_model=List[Notification])
async def list_notifications(user=Depends(get_current_user)):
    docs = await db.notifications.find(
        {"$or": [{"target": "all"}, {"target": "user", "user_id": user["id"]}]}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    return [Notification(**d) for d in docs]


@api_router.post("/notifications", response_model=Notification, status_code=201)
async def create_notification(body: NotificationCreate, admin=Depends(get_admin)):
    n = Notification(**body.model_dump())
    await db.notifications.insert_one(n.model_dump())
    return n


# ============================== CONTACT ==============================
@api_router.post("/contact", response_model=ContactMessage, status_code=201)
async def submit_contact(body: ContactMessageCreate):
    m = ContactMessage(**body.model_dump())
    await db.contact_messages.insert_one(m.model_dump())
    return m


@api_router.get("/contact/messages", response_model=List[ContactMessage])
async def list_contact(admin=Depends(get_admin)):
    docs = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [ContactMessage(**d) for d in docs]


# ============================== HEALTH ==============================
@api_router.get("/")
async def root():
    return {"app": "Comman School LMS", "tagline": "Learn Anytime, Anywhere"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# ============================== STARTUP SEED ==============================
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.courses.create_index("id", unique=True)
    await db.enrollments.create_index([("user_id", 1), ("course_id", 1)], unique=True)

    # Seed admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "password": hash_password(ADMIN_PASSWORD),
            "name": TEACHER_NAME,
            "phone": SUPPORT_NUMBER,
            "role": "admin",
            "created_at": utcnow(),
        })
        logger.info("Admin seeded.")

    # Seed default settings
    if not await db.settings.find_one({"key": "global"}):
        await db.settings.insert_one({"key": "global", **Settings().model_dump()})

    # Seed FAQs
    if await db.faqs.count_documents({}) == 0:
        await db.faqs.insert_many([
            {**FAQ(question="How do I enroll in a course?",
                   answer="Browse courses, tap 'Enroll Now', then complete UPI payment and upload the screenshot. Admin will approve within 24 hours.",
                   order=1).model_dump()},
            {**FAQ(question="Are live classes recorded?",
                   answer="Yes, every live class is recorded and available in your dashboard under recorded lectures.",
                   order=2).model_dump()},
            {**FAQ(question="Which board does Comman School teach?",
                   answer="We specialize in Gujarat Board English Medium curriculum for all standards.",
                   order=3).model_dump()},
            {**FAQ(question="How do I get a certificate?",
                   answer="Complete a course and your certificate will be auto-issued on your dashboard.",
                   order=4).model_dump()},
            {**FAQ(question="Can I get a refund?",
                   answer="Refund policy is detailed in our Terms & Conditions. Please contact support via WhatsApp.",
                   order=5).model_dump()},
        ])

    # Seed testimonials
    if await db.testimonials.count_documents({}) == 0:
        await db.testimonials.insert_many([
            Testimonial(name="Aarav Patel", role="Class 10 Student",
                        quote="Praveen Sir explains every topic so clearly. My marks jumped from 60% to 88%!", rating=5).model_dump(),
            Testimonial(name="Diya Shah", role="Class 12 Student",
                        quote="Live classes feel like a real classroom. Recordings save me when I miss any session.", rating=5).model_dump(),
            Testimonial(name="Riya Mehta", role="Class 9 Student",
                        quote="The PDF notes and assignments are top-notch. Highly recommended!", rating=5).model_dump(),
            Testimonial(name="Karan Joshi", role="Class 11 Student",
                        quote="Affordable and quality content. Best LMS for Gujarat Board.", rating=5).model_dump(),
        ])

    # Seed courses (only if none)
    if await db.courses.count_documents({}) == 0:
        sample_courses = [
            CourseCreate(title="Class 10 - Complete Mathematics",
                         description="Full syllabus coverage for Class 10 Mathematics — Algebra, Geometry, Trigonometry, Statistics. Includes live classes, recorded lectures, PDF notes, weekly tests, and doubt sessions.",
                         category="Class 10", price=2999, discount_price=1499, validity_days=365, duration="6 months", level="Intermediate"),
            CourseCreate(title="Class 12 - Science Stream",
                         description="Physics, Chemistry, Biology & Maths comprehensive prep aligned with Gujarat Board for Class 12 Science students. Board + competitive exam ready.",
                         category="Class 12", price=4999, discount_price=2499, validity_days=365, duration="9 months", level="Advanced"),
            CourseCreate(title="Class 9 - All Subjects",
                         description="Foundation building for Class 9 — Maths, Science, Social Science, English & Gujarati covered with daily practice problems.",
                         category="Class 9", price=2499, discount_price=1299, validity_days=365, duration="6 months", level="Beginner"),
            CourseCreate(title="Class 11 - Commerce",
                         description="Accountancy, Business Studies, Economics, Statistics for Commerce stream students. Includes practical problem-solving sessions.",
                         category="Class 11", price=3999, discount_price=1999, validity_days=365, duration="9 months", level="Intermediate"),
            CourseCreate(title="English Speaking Mastery",
                         description="Free crash course to improve spoken English fluency — for all students.",
                         category="Languages", price=0, is_free=True, validity_days=180, duration="2 months", level="Beginner"),
            CourseCreate(title="Class 10 - Science Booster",
                         description="Focused Science prep with experiments, diagrams & 50+ solved board questions.",
                         category="Class 10", price=1999, discount_price=999, validity_days=180, duration="4 months", level="Intermediate"),
        ]
        for c in sample_courses:
            await db.courses.insert_one(Course(**c.model_dump()).model_dump())


@app.on_event("shutdown")
async def shutdown():
    client.close()
