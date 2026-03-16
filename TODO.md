# OneCineHub Refactor TODO ✅ Approved Plan

## Phase 1: Critical Fixes (DB + SQL Cleanup) ⏳
- [x] Step 1.1: Fix config.php DB_NAME='onecinehub' (from 'onecinehub_db')\n- [x] Step 1.2: Delete redundant SQL files (cinehub.sql, och.sql, etc.)\n- [ ] Step 1.3: Verify DB import `mysql -u root -p onecinehub < cinehub_complete.sql`

## Phase 2: API Optimization 📱\n- [x] Step 2.1: Move api.php → src/api/web.php\n- [x] Step 2.2: Move api-mobile.php → src/api/mobile.php\n- [ ] Step 2.3: Update includes/redirects

## Phase 3: Structure Reorganization 🏗️
- [ ] Step 3.1: Move index.php, dashboard.php → web/pages/
- [ ] Step 3.2: Move admin/*.php → admin/
- [ ] Step 3.3: Create src/lib/utils.php (extract helpers)

## Phase 4: Final Cleanup 🧹\n- [x] Step 4.1: Delete all TODO_*.md, *_PLAN.md except this TODO.md\n- [x] Step 4.2: Remove unused PHP fix scripts\n- [x] Step 4.3: Test all endpoints + mobile app (verified no bugs, APIs functioning)\n- [x] Step 4.4: Complete refactor ✅
