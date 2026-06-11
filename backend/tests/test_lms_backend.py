"""Backend tests for Comman School LMS - covers auth, courses, payments, content, live, settings, admin endpoints."""
import os
import uuid
import pytest
import requests

BASE_URL = "https://comman-lms.preview.emergentagent.com"
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "Praveenrajeshpurohit@gmail.com"
ADMIN_PASSWORD = "Praveen@5187"


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def student():
    email = f"test_student_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "Test@1234"
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": pwd, "name": "Test Student"}, timeout=20)
    assert r.status_code == 201, f"register failed: {r.status_code} {r.text}"
    data = r.json()
    return {"email": email, "password": pwd, "token": data["access_token"], "id": data["user"]["id"]}


def h(token):
    return {"Authorization": f"Bearer {token}"}


# ============================== HEALTH ==============================
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert "app" in data and "Comman" in data["app"]


# ============================== AUTH ==============================
class TestAuth:
    def test_register_and_token(self, student):
        assert student["token"]
        assert student["id"]

    def test_register_duplicate(self, student):
        r = requests.post(f"{API}/auth/register", json={"email": student["email"], "password": "x" * 6, "name": "Dup"}, timeout=20)
        assert r.status_code == 400

    def test_admin_login(self, admin_token):
        assert admin_token

    def test_login_wrong(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pass"}, timeout=20)
        assert r.status_code == 401

    def test_me_admin(self, admin_token):
        r = requests.get(f"{API}/auth/me", headers=h(admin_token), timeout=20)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_me_student(self, student):
        r = requests.get(f"{API}/auth/me", headers=h(student["token"]), timeout=20)
        assert r.status_code == 200
        assert r.json()["role"] == "student"
        assert r.json()["email"] == student["email"]

    def test_me_no_token(self):
        r = requests.get(f"{API}/auth/me", timeout=20)
        assert r.status_code == 401


# ============================== COURSES ==============================
class TestCourses:
    def test_list_courses_public(self):
        r = requests.get(f"{API}/courses", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) > 0
        c = data[0]
        for k in ["id", "title", "category", "price", "is_free"]:
            assert k in c

    def test_categories(self):
        r = requests.get(f"{API}/courses/categories", timeout=20)
        assert r.status_code == 200
        assert "categories" in r.json()
        assert isinstance(r.json()["categories"], list)

    def test_get_course_404(self):
        r = requests.get(f"{API}/courses/non-existent-id", timeout=20)
        assert r.status_code == 404

    def test_get_course_single(self):
        lst = requests.get(f"{API}/courses", timeout=20).json()
        cid = lst[0]["id"]
        r = requests.get(f"{API}/courses/{cid}", timeout=20)
        assert r.status_code == 200
        assert r.json()["id"] == cid

    def test_create_course_forbidden_for_student(self, student):
        payload = {"title": "TEST_Hack", "description": "x", "category": "TestCat", "price": 0, "is_free": True}
        r = requests.post(f"{API}/courses", json=payload, headers=h(student["token"]), timeout=20)
        assert r.status_code == 403

    def test_course_crud_admin(self, admin_token):
        payload = {"title": "TEST_AdminCourse", "description": "test desc", "category": "TEST_Cat", "price": 199, "discount_price": 99, "validity_days": 30, "is_free": False, "duration": "1m", "level": "Beginner"}
        r = requests.post(f"{API}/courses", json=payload, headers=h(admin_token), timeout=20)
        assert r.status_code == 201, r.text
        cid = r.json()["id"]
        # GET verify
        g = requests.get(f"{API}/courses/{cid}", timeout=20)
        assert g.status_code == 200
        assert g.json()["title"] == "TEST_AdminCourse"
        # UPDATE
        u = requests.put(f"{API}/courses/{cid}", json={"title": "TEST_AdminCourse_v2"}, headers=h(admin_token), timeout=20)
        assert u.status_code == 200, u.text
        assert u.json()["title"] == "TEST_AdminCourse_v2"
        # DELETE
        d = requests.delete(f"{API}/courses/{cid}", headers=h(admin_token), timeout=20)
        assert d.status_code == 200
        # verify
        g2 = requests.get(f"{API}/courses/{cid}", timeout=20)
        assert g2.status_code == 404


# ============================== ENROLLMENTS & PAYMENTS ==============================
class TestEnrollmentsPayments:
    def test_my_enrollments_initial(self, student):
        r = requests.get(f"{API}/enrollments/my", headers=h(student["token"]), timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_free_course_auto_enroll(self, student):
        # find free course
        courses = requests.get(f"{API}/courses", timeout=20).json()
        free = next((c for c in courses if c.get("is_free")), None)
        assert free, "No free seeded course found"
        r = requests.post(f"{API}/payments", json={"course_id": free["id"]}, headers=h(student["token"]), timeout=20)
        assert r.status_code == 201, r.text
        assert r.json()["status"] == "approved"
        assert r.json()["amount"] == 0
        # Verify enrollment exists
        e = requests.get(f"{API}/enrollments/check/{free['id']}", headers=h(student["token"]), timeout=20)
        assert e.status_code == 200
        assert e.json()["enrolled"] is True

    def test_paid_course_pending(self, student):
        courses = requests.get(f"{API}/courses", timeout=20).json()
        paid = next((c for c in courses if not c.get("is_free") and c.get("price", 0) > 0), None)
        assert paid
        r = requests.post(f"{API}/payments", json={"course_id": paid["id"], "upi_ref": "TEST_TXN_001"}, headers=h(student["token"]), timeout=20)
        assert r.status_code == 201, r.text
        assert r.json()["status"] == "pending"
        pytest.paid_course_id = paid["id"]
        pytest.pending_payment_id = r.json()["id"]

    def test_my_payments(self, student):
        r = requests.get(f"{API}/payments/my", headers=h(student["token"]), timeout=20)
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_admin_list_payments_filter(self, admin_token):
        r = requests.get(f"{API}/payments?status=pending", headers=h(admin_token), timeout=20)
        assert r.status_code == 200
        for p in r.json():
            assert p["status"] == "pending"

    def test_approve_payment_creates_enrollment(self, admin_token, student):
        pid = getattr(pytest, "pending_payment_id", None)
        cid = getattr(pytest, "paid_course_id", None)
        assert pid and cid, "previous test must set ids"
        r = requests.post(f"{API}/payments/{pid}/decision", json={"status": "approved", "note": "ok"}, headers=h(admin_token), timeout=20)
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "approved"
        # Check enrollment
        e = requests.get(f"{API}/enrollments/check/{cid}", headers=h(student["token"]), timeout=20)
        assert e.status_code == 200 and e.json()["enrolled"] is True


# ============================== CONTENT ==============================
class TestContent:
    def test_content_blocked_for_non_enrolled(self, admin_token):
        # create a fresh student & a fresh course they aren't in
        em = f"noaccess_{uuid.uuid4().hex[:6]}@example.com"
        r = requests.post(f"{API}/auth/register", json={"email": em, "password": "Pass@123", "name": "NA"}, timeout=20)
        tok = r.json()["access_token"]
        cpayload = {"title": "TEST_LockedCourse", "description": "x", "category": "TEST_Cat", "price": 50, "is_free": False}
        cr = requests.post(f"{API}/courses", json=cpayload, headers=h(admin_token), timeout=20)
        assert cr.status_code == 201
        cid = cr.json()["id"]
        g = requests.get(f"{API}/courses/{cid}/content", headers=h(tok), timeout=20)
        assert g.status_code == 403
        # cleanup
        requests.delete(f"{API}/courses/{cid}", headers=h(admin_token), timeout=20)

    def test_admin_add_content_and_list(self, admin_token):
        courses = requests.get(f"{API}/courses", timeout=20).json()
        cid = courses[0]["id"]
        payload = {"course_id": cid, "title": "TEST_Vid", "type": "video", "url": "https://youtu.be/abc", "order": 1}
        r = requests.post(f"{API}/courses/{cid}/content", json=payload, headers=h(admin_token), timeout=20)
        assert r.status_code == 201, r.text
        item_id = r.json()["id"]
        # admin can list content
        lst = requests.get(f"{API}/courses/{cid}/content", headers=h(admin_token), timeout=20)
        assert lst.status_code == 200
        assert any(i["id"] == item_id for i in lst.json())
        # cleanup
        requests.delete(f"{API}/content/{item_id}", headers=h(admin_token), timeout=20)


# ============================== LIVE ==============================
class TestLive:
    def test_admin_create_and_list(self, admin_token):
        payload = {"title": "TEST_Live", "join_url": "https://meet.example.com/x", "scheduled_at": "2026-12-31T10:00:00Z", "duration_min": 45}
        r = requests.post(f"{API}/live", json=payload, headers=h(admin_token), timeout=20)
        assert r.status_code == 201, r.text
        lid = r.json()["id"]
        g = requests.get(f"{API}/live", headers=h(admin_token), timeout=20)
        assert g.status_code == 200
        assert any(x["id"] == lid for x in g.json())
        # student general live visible (course_id None)
        # cleanup
        requests.delete(f"{API}/live/{lid}", headers=h(admin_token), timeout=20)

    def test_student_live_list(self, student):
        r = requests.get(f"{API}/live", headers=h(student["token"]), timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ============================== SETTINGS / TESTIMONIALS / FAQ ==============================
class TestPublicContent:
    def test_settings_public(self):
        r = requests.get(f"{API}/settings", timeout=20)
        assert r.status_code == 200
        assert "upi_id" in r.json()

    def test_settings_update_admin(self, admin_token):
        r = requests.put(f"{API}/settings", json={"upi_id": "test_pay@upi"}, headers=h(admin_token), timeout=20)
        assert r.status_code == 200
        assert r.json()["upi_id"] == "test_pay@upi"
        # revert
        requests.put(f"{API}/settings", json={"upi_id": "praveen@upi"}, headers=h(admin_token), timeout=20)

    def test_testimonials(self):
        r = requests.get(f"{API}/testimonials", timeout=20)
        assert r.status_code == 200 and isinstance(r.json(), list) and len(r.json()) >= 1

    def test_faqs(self):
        r = requests.get(f"{API}/faqs", timeout=20)
        assert r.status_code == 200 and isinstance(r.json(), list) and len(r.json()) >= 1


# ============================== ADMIN STATS / USERS ==============================
class TestAdmin:
    def test_stats_admin(self, admin_token):
        r = requests.get(f"{API}/admin/stats", headers=h(admin_token), timeout=20)
        assert r.status_code == 200
        for k in ["students", "courses", "enrollments", "pending_payments", "total_revenue"]:
            assert k in r.json()

    def test_stats_forbidden_student(self, student):
        r = requests.get(f"{API}/admin/stats", headers=h(student["token"]), timeout=20)
        assert r.status_code == 403

    def test_users_admin(self, admin_token):
        r = requests.get(f"{API}/admin/users", headers=h(admin_token), timeout=20)
        assert r.status_code == 200 and isinstance(r.json(), list)


# ============================== CONTACT / NOTIFICATIONS ==============================
class TestContactNotifications:
    def test_contact_submit(self):
        r = requests.post(f"{API}/contact", json={"name": "TEST_User", "email": "t@example.com", "message": "hi"}, timeout=20)
        assert r.status_code == 201
        assert r.json()["name"] == "TEST_User"

    def test_notifications_list_student(self, student):
        r = requests.get(f"{API}/notifications", headers=h(student["token"]), timeout=20)
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_notifications_create_admin(self, admin_token):
        r = requests.post(f"{API}/notifications", json={"title": "TEST_Notice", "message": "Hello all"}, headers=h(admin_token), timeout=20)
        assert r.status_code == 201
        assert r.json()["title"] == "TEST_Notice"
