-- ============================================================
-- DNDB — FULL SCHEMA + SEED + BACKEND MIGRATION
-- Chạy file này 1 lần duy nhất trong Supabase SQL Editor.
-- File này gộp supabase_schema.sql gốc (đã sửa kiểu id → text)
-- + 001_full_migration.sql (profiles, quiz, leaderboard, recommendations)
-- ============================================================

-- ============================================================
-- PHẦN 1 — BẢNG GỐC (stars, planets, achievements)
-- Đã sửa kiểu id từ uuid → text để khớp với seed data slug
-- ============================================================

CREATE TABLE IF NOT EXISTS stars (
  id        text PRIMARY KEY,
  name      text NOT NULL,
  color     text NOT NULL,
  position_x float NOT NULL,
  position_y float NOT NULL,
  icon      text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS planets (
  id          text PRIMARY KEY,
  star_id     text REFERENCES stars(id) ON DELETE CASCADE,
  name        text NOT NULL,
  bio         text,
  avatar_url  text,
  avatar_url_2 text,
  avatar_url_3 text,
  orbit_radius float NOT NULL,
  orbit_speed  float DEFAULT 1,
  planet_seed  integer NOT NULL UNIQUE,
  planet_size  float DEFAULT 1,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS achievements (
  id          text PRIMARY KEY,
  planet_id   text REFERENCES planets(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  year        integer,
  category    text
);

ALTER TABLE stars        ENABLE ROW LEVEL SECURITY;
ALTER TABLE planets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to stars"        ON stars;
DROP POLICY IF EXISTS "Allow public read access to planets"      ON planets;
DROP POLICY IF EXISTS "Allow public read access to achievements" ON achievements;
CREATE POLICY "Allow public read access to stars"        ON stars        FOR SELECT USING (true);
CREATE POLICY "Allow public read access to planets"      ON planets      FOR SELECT USING (true);
CREATE POLICY "Allow public read access to achievements" ON achievements FOR SELECT USING (true);

-- ============================================================
-- SEED DATA — Stars
-- ============================================================

INSERT INTO stars (id, name, color, position_x, position_y, icon) VALUES
('a7777777-7777-7777-7777-777777777777', 'Văn Hóa',   '#ec4899', -0.914, -0.06,  '🎭'),
('a2222222-2222-2222-2222-222222222222', 'Nghệ thuật', '#a855f7', -0.468,  0.264, '🎨'),
('a3333333-3333-3333-3333-333333333333', 'Khoa học',  '#22c55e', -0.430,  0.340, '🔬'),
('a5555555-5555-5555-5555-555555555555', 'Chính trị', '#6366f1', -0.164,  0.124, '👑'),
('a4444444-4444-4444-4444-444444444444', 'Triết học', '#eab308',  0.216,  0.016, '📜'),
('a8888888-8888-8888-8888-888888888888', 'Quân sự',   '#ef4444',  0.356, -0.456, '⚔️'),
('a6666666-6666-6666-6666-666666666666', 'Giáo dục',  '#f97316',  0.894, -0.24,  '🎓'),
('a1111111-1111-1111-1111-111111111111', 'Công nghệ', '#3b82f6',  0.89,   0.38,  '💻')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, color = EXCLUDED.color,
  position_x = EXCLUDED.position_x, position_y = EXCLUDED.position_y, icon = EXCLUDED.icon;

-- ============================================================
-- SEED DATA — Planets
-- ============================================================

INSERT INTO planets (id, star_id, name, bio, avatar_url, orbit_radius, orbit_speed, planet_seed, planet_size) VALUES
('nguyen-trai',       'a7777777-7777-7777-7777-777777777777', 'Nguyễn Trãi',       'Nguyễn Trãi (hiệu Ức Trai) là một nhà chính trị, nhà quân sự kiệt xuất và danh nhân văn hóa thế giới thời Lê sơ. Ông là người đã phò tá Lê Lợi lật đổ ách đô hộ của nhà Minh, soạn thảo áng văn thiên cổ bất hủ "Bình Ngô Đại Cáo" khẳng định nền độc lập trường tồn của dân tộc Việt Nam.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 2.3, 1.0,  45781, 0.54),
('nguyen-du',         'a7777777-7777-7777-7777-777777777777', 'Nguyễn Du',         'Nguyễn Du (tự Tố Như, hiệu Thanh Hiên) là nhà thơ lớn của Việt Nam thời Tây Sơn và đầu triều Nguyễn. Với vốn hiểu biết sâu rộng, trái tim nhân đạo mênh mông, ông đã viết nên kiệt tác "Truyện Kiều" khắc họa số phận đau khổ của con người trong xã hội phong kiến.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 4.0, 0.7,  98124, 0.48),
('trinh-cong-son',    'a2222222-2222-2222-2222-222222222222', 'Trịnh Công Sơn',    'Trịnh Công Sơn được coi là một trong những nhạc sĩ lớn nhất của Tân nhạc Việt Nam. Nhạc của ông đậm chất triết lý nhân sinh, thấm đượm tình yêu, thân phận và ước vọng hòa bình. Những sáng tác bất hủ như "Diễm xưa", "Cát bụi", "Huyền thoại mẹ" chứa đựng dòng âm điệu mê hoặc lòng người qua nhiều thế hệ.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 2.5, 0.9,  11223, 0.52),
('to-ngoc-van',       'a2222222-2222-2222-2222-222222222222', 'Tô Ngọc Vân',       'Tô Ngọc Vân là một họa sĩ xuất sắc, thuộc thế hệ đầu tiên của Trường Cao đẳng Mỹ thuật Đông Dương. Ông đã đóng góp to lớn vào việc đưa chất liệu sơn dầu phương Tây hòa quyện đậm đà với linh hồn dân tộc Việt Nam.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 4.2, 0.6,  55443, 0.46),
('luong-the-vinh',    'a3333333-3333-3333-3333-333333333333', 'Lương Thế Vinh',    'Lương Thế Vinh là trạng nguyên dưới thời vua Lê Thánh Tông. Ông là một nhà toán học lỗi lạc, tác giả cuốn sách "Đại thành toán pháp" — cuốn sách toán giáo lý hoàn chỉnh đầu tiên của nước ta. Ông được mệnh danh là "Trạng Lường" nhờ tài đo đạc và tư duy toán học thông thái.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 2.0, 1.1,  88776, 0.48),
('ton-that-tung',     'a3333333-3333-3333-3333-333333333333', 'Tôn Thất Tùng',     'Tôn Thất Tùng là bác sĩ y học vĩ đại người Việt Nam, nổi danh khắp năm châu nhờ phương pháp mổ gan "khô" vô cùng nhanh chóng và hiệu quả, giảm tỷ lệ tử vong và biến chứng tối đa cho bệnh nhân.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 3.8, 0.8,  66554, 0.52),
('ho-chi-minh',       'a5555555-5555-5555-5555-555555555555', 'Hồ Chí Minh',       'Hồ Chí Minh là vị lãnh tụ vĩ đại của cách mạng Việt Nam, người sáng lập Đảng Cộng sản Việt Nam và khai sinh ra nước Việt Nam Dân chủ Cộng hòa độc lập. Ông dâng trọn đời mình cho độc lập tự do của dân tộc.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 2.6, 1.25, 77112, 0.56),
('tran-hung-dao',     'a5555555-5555-5555-5555-555555555555', 'Trần Hưng Đạo',     'Trần Quốc Tuấn (tước hiệu Trần Hưng Đạo) không chỉ là nhà quân sự mà còn là một chính trị gia khôn khéo tầm quốc tế. Ông khuyên răn các vua Trần gắn bó mật thiết với nhân dân bảo vệ bờ cõi bằng tinh thần "khoan thư sức dân làm kế sâu rễ bền gốc".', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 4.5, 0.75, 99001, 0.54),
('chu-van-an',        'a4444444-4444-4444-4444-444444444444', 'Chu Văn An',        'Chu Văn An là nhà triết giáo, nhà sư phạm lỗi lạc chính trực và mẫu mực của Đại Việt thời Trần. Ông là người biên soạn giáo án "Tứ thư thuyết ước" truyền thụ tư tưởng nhân nghĩa. Ông từng dâng sớ chém 7 nịnh thần triều đình để cứu nước.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 2.4, 1.0,  77665, 0.48),
('nguyen-binh-khiem', 'a4444444-4444-4444-4444-444444444444', 'Nguyễn Bỉnh Khiêm', 'Nguyễn Bỉnh Khiêm là triết học gia lỗi lạc có tầm nhìn chiến lược đi trước hàng trăm năm lịch sử trung đại Việt Nam. Với kiến thức Dịch học uyên thâm, ông am tường thế giới tự nhiên và xã hội.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 4.0, 0.7,  88221, 0.52),
('vo-nguyen-giap',    'a8888888-8888-8888-8888-888888888888', 'Võ Nguyên Giáp',    'Võ Nguyên Giáp là Đại tướng đầu tiên, Tổng tư lệnh Quân đội Nhân dân Việt Nam anh hùng. Được ghi danh là một trong những thống soái vĩ đại nhất của văn minh loài người, ông đã đánh bại hai đế quốc thực dân Pháp và Mỹ bằng nghệ thuật chiến tranh nhân dân sáng tạo.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 2.5, 1.15, 44889, 0.58),
('ly-thuong-kiet',    'a8888888-8888-8888-8888-888888888888', 'Lý Thường Kiệt',    'Lý Thường Kiệt là một danh tướng kiệt xuất đời nhà Lý Việt Nam. Ông lập công hiển hách đánh Tống, bình Chiêm giữ vững phên giậu nước nhà. Ông chủ trương tiên phát chế nhân, kiến tạo phòng tuyến sông Như Nguyệt huyền thoại.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 4.4, 0.65, 12299, 0.5),
('le-quy-don',        'a6666666-6666-6666-6666-666666666666', 'Lê Quý Đôn',        'Lê Quý Đôn là nhà bác học lớn nhất thời trung đại Việt Nam. Với tư duy bác học bách khoa uyên thâm bậc nhất, ông biên soạn giáo trình giảng dạy khổng lồ, tổng hợp tri thức về triết học, địa lý, sử học, văn học, thiên văn.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 2.7, 0.95, 55667, 0.5),
('nguyen-dinh-chieu', 'a6666666-6666-6666-6666-666666666666', 'Nguyễn Đình Chiểu', 'Nguyễn Đình Chiểu (cụ Đồ Chiểu) là danh nhân xuất thân nhà giáo mẫu mực ái quốc lỗi lạc ở phương Nam. Bị mù từ trẻ, cụ Đồ Chiểu vượt lên bi kịch mở trường dạy học, bốc thuốc cứu người và sáng tác những vần thơ bất hủ kích lệ tinh thần đánh giặc.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 4.6, 0.6,  33221, 0.46),
('tran-dai-nghia',    'a1111111-1111-1111-1111-111111111111', 'Trần Đại Nghĩa',    'Phạm Quang Lễ (tên hiệu Trần Đại Nghĩa) là giáo sư, viện sĩ khoa học sáng chế vĩ đại thời đại Hồ Chí Minh. Ông theo Bác Hồ về nước trực tiếp thiết kế, chế tạo nên khí tài đặc chủng Bazooka, SKZ hủy diệt xe tăng lô cốt thực dân.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 2.4, 1.05, 77119, 0.53),
('nguyen-an',         'a1111111-1111-1111-1111-111111111111', 'Nguyễn An',         'Nguyễn An là kiến trúc sư đại tài người Việt dưới triều Minh. Bị bắt sang Trung Quốc, nhờ tài cao về cấu trúc xây dựng, ông được giao đại nhiệm thiết kế và làm tổng đốc xây dựng Tử Cấm Thành uy nghi tại Bắc Kinh.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 4.5, 0.7,  99112, 0.48)
ON CONFLICT (id) DO UPDATE SET
  star_id = EXCLUDED.star_id, name = EXCLUDED.name, bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url, orbit_radius = EXCLUDED.orbit_radius,
  orbit_speed = EXCLUDED.orbit_speed, planet_seed = EXCLUDED.planet_seed,
  planet_size = EXCLUDED.planet_size;

-- ============================================================
-- SEED DATA — Achievements
-- ============================================================

INSERT INTO achievements (id, planet_id, title, description, year, category) VALUES
('c7777777-1111-1111-1111-111111111111', 'nguyen-trai',       'Soạn thảo Bình Ngô Đại Cáo',          'Chủ trì soạn thảo Đại bản tuyên ngôn độc lập thứ hai của dân tộc Việt Nam sau chiến thắng giặc Minh.', 1428, 'Văn chương'),
('c7777777-1111-1111-1111-222222222222', 'nguyen-trai',       'Danh nhân Văn hóa Thế giới',           'Được UNESCO vinh danh nhân kỷ niệm 600 năm ngày sinh.', 1980, 'UNESCO'),
('c7777777-1111-1111-1111-333333333333', 'nguyen-trai',       'Quốc âm thi tập',                      'Tác giả tập thơ Nôm cổ nhất và phong phú nhất còn lưu lại, đặt nền móng văn học dân tộc.', 1430, 'Thơ Nôm'),
('c7777777-2222-1111-1111-111111111111', 'nguyen-du',         'Sáng tác kiệt tác Truyện Kiều',        'Bản trường ca thơ lục bát kiệt xuất, đỉnh cao văn học trung đại, dịch ra hơn 20 ngôn ngữ.', 1810, 'Văn học'),
('c7777777-2222-1111-1111-222222222222', 'nguyen-du',         'Vinh danh Văn hóa Thế giới',           'Được Hội đồng Hòa bình Thế giới kỷ niệm sinh nhật như một Danh nhân Văn hóa Thế giới.', 1965, 'Danh nhân'),
('c2222222-1111-1111-1111-111111111111', 'trinh-cong-son',    'Nhận giải thưởng đĩa vàng',            'Nhận giải thưởng đĩa vàng tại Nhật Bản cho ca khúc "Diễm xưa".', 1972, 'Âm nhạc'),
('c2222222-1111-1111-1111-222222222222', 'trinh-cong-son',    'Giải Âm nhạc Hòa bình Quốc tế',       'Được trao tặng giải thưởng Âm nhạc hòa bình quốc tế cho những thông điệp nhân văn trong tác phẩm.', 2004, 'Hòa bình'),
('c2222222-2222-1111-1111-111111111111', 'to-ngoc-van',       'Vẽ kiệt tác Thiếu nữ bên hoa huệ',    'Sáng tác bức họa sơn dầu kinh điển mang tính biểu tượng của nền mỹ thuật Việt Nam hiện đại.', 1943, 'Mỹ thuật'),
('c3333333-1111-1111-1111-111111111111', 'luong-the-vinh',    'Đại thành toán pháp',                  'Biên soạn bộ sách toán học giáo khoa đầu tiên của Việt Nam, ứng dụng đo đạc vĩ đại.', 1470, 'Toán học'),
('c3333333-2222-1111-1111-111111111111', 'ton-that-tung',     'Phát minh phương pháp cắt gan khô',    'Phát minh ra phương pháp mổ cắt gan cực nhanh mang tên "Phương pháp Tôn Thất Tùng" nổi tiếng toàn cầu.', 1939, 'Y học'),
('c5555555-1111-1111-1111-111111111111', 'ho-chi-minh',       'Đọc Tuyên ngôn Độc lập',               'Đọc bản Tuyên ngôn Độc lập tại quảng trường Ba Đình lịch sử khai sinh ra nước Việt Nam Dân chủ Cộng hòa.', 1945, 'Chính trị'),
('c5555555-1111-1111-1111-222222222222', 'ho-chi-minh',       'Danh nhân Văn hóa - Anh hùng dân tộc','Được UNESCO công nhận là Anh hùng giải phóng dân tộc Việt Nam và Nhà văn hóa kiệt xuất.', 1990, 'UNESCO'),
('c5555555-2222-1111-1111-111111111111', 'tran-hung-dao',     'Chiến thắng sông Bạch Đằng',           'Đại thắng quân Mông Nguyên lần thứ 3 trên sông Bạch Đằng bằng chiến thuật cọc gỗ độc đáo.', 1288, 'Quân sự'),
('c4444444-1111-1111-1111-111111111111', 'chu-van-an',        'Dâng sớ Thất trảm sớ',                 'Khảng khái dâng sớ xin chém đầu 7 nịnh thần triều đình tham nhũng hại dân hại nước dưới triều Trần.', 1360, 'Tư tưởng'),
('c8888888-1111-1111-1111-111111111111', 'vo-nguyen-giap',    'Đại thắng Điện Biên Phủ',              'Chỉ huy chiến dịch đánh sập tập đoàn cứ điểm Điện Biên Phủ của quân viễn chinh Pháp lừng lẫy địa cầu.', 1954, 'Quân sự'),
('c8888888-2222-1111-1111-111111111111', 'ly-thuong-kiet',    'Nam quốc sơn hà',                      'Tác giả bài thơ thần vang dội tại phòng tuyến sông Như Nguyệt, được coi là bản Tuyên ngôn Độc lập đầu tiên.', 1077, 'Quân sự'),
('c6666666-1111-1111-1111-111111111111', 'le-quy-don',        'Biên soạn Vân đài loại ngữ',           'Tác phẩm bách khoa toàn thư tri thức khoa học giáo dục đầu tiên của Việt Nam.', 1773, 'Bác học'),
('c1111111-1111-1111-1111-111111111111', 'tran-dai-nghia',    'Chế tạo vũ khí Bazooka quân sự',       'Nghiên cứu cải tiến và trực tiếp chế tạo súng Bazooka và súng không giật SKZ phá hủy xe tăng lô cốt giặc Pháp.', 1947, 'Chế tạo')
ON CONFLICT (id) DO UPDATE SET
  planet_id = EXCLUDED.planet_id, title = EXCLUDED.title,
  description = EXCLUDED.description, year = EXCLUDED.year, category = EXCLUDED.category;

-- ============================================================
-- PHẦN 2 — BACKEND MỚI (profiles, quiz, leaderboard, recommendations)
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    text NOT NULL,
  avatar_url      text,
  total_points    integer NOT NULL DEFAULT 0,
  level           integer NOT NULL DEFAULT 1,
  current_streak  integer NOT NULL DEFAULT 0,
  longest_streak  integer NOT NULL DEFAULT 0,
  last_active_date date,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE IF NOT EXISTS questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planet_id     text REFERENCES planets(id) ON DELETE SET NULL,
  star_id       text,
  question_text text NOT NULL,
  options       jsonb NOT NULL,
  correct_index smallint NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  explanation   text,
  difficulty    text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category      text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_questions  smallint NOT NULL DEFAULT 10,
  score            smallint DEFAULT 0,
  points_earned    integer DEFAULT 0,
  duration_seconds integer,
  started_at       timestamptz DEFAULT now(),
  completed_at     timestamptz
);

CREATE TABLE IF NOT EXISTS quiz_answers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     uuid NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id    uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_index smallint NOT NULL CHECK (selected_index >= 0 AND selected_index <= 3),
  is_correct     boolean NOT NULL,
  time_spent_ms  integer,
  answered_at    timestamptz DEFAULT now(),
  UNIQUE(session_id, question_id)
);

CREATE TABLE IF NOT EXISTS user_planet_views (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  planet_id text NOT NULL REFERENCES planets(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, planet_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_planet   ON questions(planet_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sessions_user       ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_session      ON quiz_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_profiles_points      ON profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_planet_views_user    ON user_planet_views(user_id);

-- Chatbot usage tracking (metadata only — no message content stored)
CREATE TABLE IF NOT EXISTS chatbot_usage (
  id          bigserial PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  text NOT NULL,      -- anonymous session identifier
  pathname    text,               -- page where chatbot was used
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_usage_user       ON chatbot_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_usage_created    ON chatbot_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_usage_pathname   ON chatbot_usage(pathname);

-- RLS
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_planet_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_usage     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles"        ON profiles;
DROP POLICY IF EXISTS \"Users update own profile\"    ON profiles;
DROP POLICY IF EXISTS \"Public read active questions\" ON questions;
DROP POLICY IF EXISTS \"Users manage own sessions\"   ON quiz_sessions;
DROP POLICY IF EXISTS \"Users manage own answers\"    ON quiz_answers;
DROP POLICY IF EXISTS \"Users manage own views\"      ON user_planet_views;
DROP POLICY IF EXISTS \"Allow insert chatbot usage\"  ON chatbot_usage;

CREATE POLICY "Public read profiles"         ON profiles    FOR SELECT USING (true);
CREATE POLICY "Users update own profile"     ON profiles    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public read active questions" ON questions   FOR SELECT USING (is_active = true);
CREATE POLICY "Users manage own sessions"    ON quiz_sessions FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users manage own answers"     ON quiz_answers FOR ALL
  USING (session_id IN (SELECT id FROM quiz_sessions WHERE user_id = auth.uid() OR user_id IS NULL));
CREATE POLICY "Users manage own views"       ON user_planet_views FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Anyone (auth or anon) can insert chatbot usage; only service_role can read
CREATE POLICY "Allow insert chatbot usage"   ON chatbot_usage FOR INSERT WITH CHECK (true);

-- DB Functions
CREATE OR REPLACE FUNCTION get_random_questions(
  p_star_id text DEFAULT NULL,
  p_count integer DEFAULT 10
)
RETURNS TABLE (
  id uuid, planet_id text, star_id text,
  question_text text, options jsonb, difficulty text, category text
) AS $$
  SELECT q.id, q.planet_id, q.star_id, q.question_text, q.options, q.difficulty, q.category
  FROM questions q
  WHERE q.is_active = true
    AND (p_star_id IS NULL OR q.star_id = p_star_id)
  ORDER BY random()
  LIMIT p_count;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION submit_quiz_answer(
  p_session_id uuid, p_question_id uuid,
  p_selected_index smallint, p_time_spent_ms integer DEFAULT NULL
)
RETURNS TABLE (is_correct boolean, correct_index smallint, explanation text) AS $$
DECLARE
  v_correct_index smallint;
  v_explanation text;
  v_is_correct boolean;
  v_session_user_id uuid;
  v_completed_at timestamptz;
BEGIN
  -- Verify session exists and get status
  SELECT user_id, completed_at INTO v_session_user_id, v_completed_at
  FROM quiz_sessions WHERE id = p_session_id;

  IF v_session_user_id IS NULL AND NOT EXISTS(SELECT 1 FROM quiz_sessions WHERE id = p_session_id) THEN
    RAISE EXCEPTION 'Phiên trả lời không tồn tại';
  END IF;

  IF v_completed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Phiên trả lời đã được hoàn thành, không thể thêm đáp án';
  END IF;

  -- Security validation: session owner check
  IF v_session_user_id IS NOT NULL AND (auth.uid() IS NULL OR auth.uid() <> v_session_user_id) THEN
    RAISE EXCEPTION 'Bạn không có quyền trả lời cho phiên này';
  END IF;

  -- Prevent duplicate answers for the same question within a session
  IF EXISTS (SELECT 1 FROM quiz_answers WHERE session_id = p_session_id AND question_id = p_question_id) THEN
    RAISE EXCEPTION 'Câu hỏi này đã được trả lời trước đó';
  END IF;

  SELECT q.correct_index, q.explanation INTO v_correct_index, v_explanation
  FROM questions q WHERE q.id = p_question_id;
  
  IF v_correct_index IS NULL THEN 
    RAISE EXCEPTION 'Không tìm thấy câu hỏi'; 
  END IF;
  
  v_is_correct := (p_selected_index = v_correct_index);
  
  INSERT INTO quiz_answers (session_id, question_id, selected_index, is_correct, time_spent_ms)
  VALUES (p_session_id, p_question_id, p_selected_index, v_is_correct, p_time_spent_ms);
  
  RETURN QUERY SELECT v_is_correct, v_correct_index, v_explanation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION finish_quiz_session(p_session_id uuid)
RETURNS TABLE (o_score smallint, o_total_questions smallint, o_points_earned integer,
               o_new_total_points integer, o_new_streak integer) AS $$
DECLARE
  v_user_id uuid;
  v_score smallint;
  v_total smallint;
  v_points integer;
  v_started_at timestamptz;
  v_last_active date;
  v_new_streak integer;
  v_new_total_points integer;
  v_completed_at timestamptz;
  v_saved_score smallint;
  v_saved_points integer;
BEGIN
  SELECT qs.user_id, qs.total_questions, qs.started_at, qs.completed_at, qs.score, qs.points_earned
  INTO v_user_id, v_total, v_started_at, v_completed_at, v_saved_score, v_saved_points
  FROM quiz_sessions qs WHERE qs.id = p_session_id;

  IF v_started_at IS NULL THEN
    RAISE EXCEPTION 'Phiên trả lời không tồn tại';
  END IF;

  -- Security validation: session owner check
  IF v_user_id IS NOT NULL AND (auth.uid() IS NULL OR auth.uid() <> v_user_id) THEN
    RAISE EXCEPTION 'Bạn không có quyền hoàn thành phiên này';
  END IF;

  -- Idempotency check: if already completed, return cached values immediately
  IF v_completed_at IS NOT NULL THEN
    IF v_user_id IS NOT NULL THEN
      SELECT p.total_points, p.current_streak INTO v_new_total_points, v_new_streak
      FROM profiles p WHERE p.id = v_user_id;
    END IF;
    RETURN QUERY SELECT v_saved_score, v_total, v_saved_points, v_new_total_points, v_new_streak;
    RETURN;
  END IF;

  SELECT COALESCE(count(*) FILTER (WHERE qa.is_correct), 0)::smallint INTO v_score
  FROM quiz_answers qa WHERE qa.session_id = p_session_id;
  
  v_points := v_score * 10;
  IF v_score = v_total THEN v_points := v_points + 5; END IF;
  
  UPDATE quiz_sessions SET score = v_score, points_earned = v_points,
    completed_at = now(),
    duration_seconds = EXTRACT(EPOCH FROM (now() - v_started_at))::integer
  WHERE id = p_session_id;
  
  IF v_user_id IS NOT NULL THEN
    SELECT p.last_active_date INTO v_last_active FROM profiles p WHERE p.id = v_user_id;
    IF v_last_active = CURRENT_DATE THEN
      v_new_streak := NULL;
    ELSIF v_last_active = CURRENT_DATE - INTERVAL '1 day' THEN
      v_new_streak := (SELECT p.current_streak + 1 FROM profiles p WHERE p.id = v_user_id);
    ELSE
      v_new_streak := 1;
    END IF;
    
    UPDATE profiles p SET
      total_points = p.total_points + v_points,
      level = GREATEST(1, FLOOR(SQRT((p.total_points + v_points) / 100.0))::integer + 1),
      current_streak = COALESCE(v_new_streak, p.current_streak),
      longest_streak = GREATEST(p.longest_streak, COALESCE(v_new_streak, p.current_streak)),
      last_active_date = CURRENT_DATE, updated_at = now()
    WHERE p.id = v_user_id
    RETURNING p.total_points, p.current_streak INTO v_new_total_points, v_new_streak;
  END IF;
  
  RETURN QUERY SELECT v_score, v_total, v_points, v_new_total_points, v_new_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_quiz_rate_limit(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*)::integer INTO v_count
  FROM quiz_sessions
  WHERE user_id = p_user_id
    AND started_at >= now() - interval '1 hour';
  
  RETURN (v_count < 20);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_recommendations(
  p_planet_id text, p_user_id uuid DEFAULT NULL, p_count integer DEFAULT 3
)
RETURNS TABLE (
  id text, name text, bio text, avatar_url text,
  star_id text, star_name text, star_color text, reason text
) AS $$
DECLARE v_star_id text;
BEGIN
  SELECT planets.star_id INTO v_star_id FROM planets WHERE planets.id = p_planet_id;
  RETURN QUERY
  WITH viewed AS (
    SELECT planet_id FROM user_planet_views WHERE user_id = p_user_id
  ),
  candidates AS (
    SELECT p.id, p.name, p.bio, p.avatar_url, p.star_id,
           'Cùng lĩnh vực với danh nhân bạn vừa xem' AS reason, 1 AS priority
    FROM planets p
    WHERE p.star_id = v_star_id AND p.id != p_planet_id
      AND (p_user_id IS NULL OR p.id NOT IN (SELECT planet_id FROM viewed))
    UNION ALL
    SELECT p.id, p.name, p.bio, p.avatar_url, p.star_id,
           'Cùng lĩnh vực, đáng xem lại' AS reason, 2 AS priority
    FROM planets p WHERE p.star_id = v_star_id AND p.id != p_planet_id
    UNION ALL
    SELECT p.id, p.name, p.bio, p.avatar_url, p.star_id,
           'Khám phá lĩnh vực mới' AS reason, 3 AS priority
    FROM planets p WHERE p.star_id != v_star_id AND p.id != p_planet_id
  )
  SELECT DISTINCT ON (c.id) c.id, c.name, c.bio, c.avatar_url, c.star_id,
         s.name AS star_name, s.color AS star_color, c.reason
  FROM candidates c JOIN stars s ON s.id = c.star_id
  ORDER BY c.id, c.priority
  LIMIT p_count;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE VIEW leaderboard AS
SELECT
  row_number() OVER (ORDER BY total_points DESC, longest_streak DESC) AS rank,
  id AS user_id, display_name, avatar_url, level,
  total_points AS points, current_streak AS streak
FROM profiles WHERE total_points > 0
ORDER BY total_points DESC, longest_streak DESC
LIMIT 100;

-- ============================================================
-- SEED DATA — Câu hỏi quiz mẫu
-- ============================================================

INSERT INTO questions (planet_id, star_id, question_text, options, correct_index, explanation, difficulty, category) VALUES
('nguyen-trai', 'a7777777-7777-7777-7777-777777777777',
 'Nguyễn Trãi soạn thảo tác phẩm nào được coi là "Tuyên ngôn độc lập" thứ hai của Việt Nam?',
 '["Quốc âm thi tập","Bình Ngô Đại Cáo","Ức Trai thi tập","Dư địa chí"]'::jsonb,
 1, 'Bình Ngô Đại Cáo (1428) do Nguyễn Trãi soạn sau chiến thắng giặc Minh, khẳng định chủ quyền và văn hiến Đại Việt.', 'easy', 'văn học'),
('vo-nguyen-giap', 'a8888888-8888-8888-8888-888888888888',
 'Đại tướng Võ Nguyên Giáp đã chỉ huy chiến dịch nào kết thúc cuộc kháng chiến chống Pháp?',
 '["Chiến dịch Việt Bắc","Chiến dịch Biên giới","Chiến dịch Điện Biên Phủ","Chiến dịch Hồ Chí Minh"]'::jsonb,
 2, 'Chiến dịch Điện Biên Phủ (1954) dưới sự chỉ huy của Đại tướng Võ Nguyên Giáp đã đập tan tập đoàn cứ điểm của quân Pháp, buộc Pháp ký Hiệp định Genève.', 'easy', 'lịch sử'),
('trinh-cong-son', 'a2222222-2222-2222-2222-222222222222',
 'Ca khúc nào của Trịnh Công Sơn được phát hành tại Nhật Bản và đạt đĩa vàng năm 1972?',
 '["Cát bụi","Huyền thoại mẹ","Diễm xưa","Nối vòng tay lớn"]'::jsonb,
 2, 'Ca khúc "Diễm xưa" do ca sĩ Nhật Bản Yoshimi Tendo hát đã bán được hơn 2 triệu đĩa tại Nhật.', 'medium', 'âm nhạc'),
('ly-thuong-kiet', 'a8888888-8888-8888-8888-888888888888',
 'Lý Thường Kiệt sử dụng chiến thuật đặc biệt nào khi đánh Tống năm 1075?',
 '["Phòng thủ tại biên giới","Tiên phát chế nhân — chủ động tấn công","Dùng ngoại giao trước","Rút lui chiến lược"]'::jsonb,
 1, 'Lý Thường Kiệt áp dụng chiến lược "tiên phát chế nhân" — chủ động tấn công sâu vào đất Tống, phá vỡ kế hoạch xâm lược trước khi chúng chuẩn bị xong.', 'hard', 'lịch sử'),
('ton-that-tung', 'a3333333-3333-3333-3333-333333333333',
 'Phát minh y học nào đã đưa tên Tôn Thất Tùng ra thế giới?',
 '["Ghép tim nhân tạo","Phương pháp cắt gan khô","Vaccine viêm gan B","Phẫu thuật não nội soi"]'::jsonb,
 1, 'Phương pháp cắt gan "khô" do GS Tôn Thất Tùng phát minh năm 1939, được giới y học quốc tế đặt tên là "Phương pháp Tôn Thất Tùng".', 'medium', 'khoa học'),
('ho-chi-minh', 'a5555555-5555-5555-5555-555555555555',
 'Hồ Chí Minh đọc bản Tuyên ngôn Độc lập tại đâu?',
 '["Quảng trường Ba Đình","Phủ Chủ tịch","Văn Miếu","Hồ Hoàn Kiếm"]'::jsonb,
 0, 'Ngày 2/9/1945, Hồ Chí Minh đọc Tuyên ngôn Độc lập tại quảng trường Ba Đình, khai sinh nước Việt Nam Dân chủ Cộng hòa.', 'easy', 'lịch sử'),
('tran-hung-dao', 'a5555555-5555-5555-5555-555555555555',
 'Trần Hưng Đạo dùng chiến thuật cọc gỗ để đánh thắng quân Nguyên Mông trên sông nào?',
 '["Sông Hồng","Sông Bạch Đằng","Sông Mã","Sông Đáy"]'::jsonb,
 1, 'Chiến thắng sông Bạch Đằng năm 1288 với chiến thuật cọc gỗ đã đánh tan đội quân Mông Nguyên hùng mạnh.', 'medium', 'quân sự'),
(NULL, NULL,
 'Chòm sao Bắc Đẩu (Đại Hùng) có bao nhiêu ngôi sao chính tạo thành hình dạng đặc trưng?',
 '["5 sao","6 sao","7 sao","8 sao"]'::jsonb,
 2, 'Chòm sao Bắc Đẩu gồm 7 ngôi sao sáng chính sắp xếp thành hình cái gáo múc nước.', 'easy', 'thiên văn')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PHẦN 3 — CÂU HỎI TRẮC NGHIỆM TÍNH CÁCH (personality_questions)
-- ============================================================

CREATE TABLE IF NOT EXISTS personality_questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  options       jsonb NOT NULL, -- Array of objects: [{text: "Option A", scores: {"star_id": 2}}]
  created_at    timestamptz DEFAULT now()
);

-- Bật RLS
ALTER TABLE personality_questions ENABLE ROW LEVEL SECURITY;

-- Policy: cho phép xem công khai, chỉ service_role mới sửa được
DROP POLICY IF EXISTS "Public read personality questions" ON personality_questions;
CREATE POLICY "Public read personality questions" ON personality_questions FOR SELECT USING (true);

-- Seed bộ câu hỏi trắc nghiệm tính cách mặc định
INSERT INTO personality_questions (question_text, options) VALUES
('Bạn thích dành thời gian rảnh của mình để làm gì nhất?', '[
  {"text": "Đọc sách, thưởng thức nghệ thuật hoặc viết lách", "scores": {"a7777777-7777-7777-7777-777777777777": 2, "a2222222-2222-2222-2222-222222222222": 2}},
  {"text": "Khám phá công nghệ mới hoặc giải đố logic", "scores": {"a3333333-3333-3333-3333-333333333333": 2, "a1111111-1111-1111-1111-111111111111": 2}},
  {"text": "Thảo luận về lịch sử, triết lý hoặc chính trị", "scores": {"a5555555-5555-5555-5555-555555555555": 2, "a4444444-4444-4444-4444-444444444444": 2}},
  {"text": "Lên kế hoạch, rèn luyện kỹ năng và tự học", "scores": {"a8888888-8888-8888-8888-888888888888": 2, "a6666666-6666-6666-6666-666666666666": 2}}
]'::jsonb),
('Lĩnh vực nào sau đây kích thích sự tò mò của bạn nhất?', '[
  {"text": "Văn học cổ điển và các giá trị văn hóa lâu đời", "scores": {"a7777777-7777-7777-7777-777777777777": 3}},
  {"text": "Công nghệ số, AI và thiết bị thông minh hiện đại", "scores": {"a1111111-1111-1111-1111-111111111111": 3}},
  {"text": "Y học cứu người và khám phá khoa học vũ trụ", "scores": {"a3333333-3333-3333-3333-333333333333": 3}},
  {"text": "Nghệ thuật quân binh và tư duy chiến lược", "scores": {"a8888888-8888-8888-8888-888888888888": 3}}
]'::jsonb),
('Khi đối mặt với một thử thách phức tạp, bạn thường làm gì?', '[
  {"text": "Tìm kiếm các giải pháp nghệ thuật, sáng tạo đột phá", "scores": {"a2222222-2222-2222-2222-222222222222": 3}},
  {"text": "Phân tích sâu sắc bản chất triết lý và đạo đức", "scores": {"a4444444-4444-4444-4444-444444444444": 3}},
  {"text": "Đứng ra dẫn dắt và tổ chức đội ngũ hành động", "scores": {"a5555555-5555-5555-5555-555555555555": 3}},
  {"text": "Học hỏi phương pháp từ những chuyên gia đi trước", "scores": {"a6666666-6666-6666-6666-666666666666": 3}}
]'::jsonb),
('Hình mẫu danh nhân nào truyền cảm hứng cho bạn nhiều nhất?', '[
  {"text": "Những người thầy tận tụy khai sáng tri thức trẻ", "scores": {"a6666666-6666-6666-6666-666666666666": 3}},
  {"text": "Những nhà phát minh kỹ thuật vĩ đại", "scores": {"a1111111-1111-1111-1111-111111111111": 3, "a3333333-3333-3333-3333-333333333333": 2}},
  {"text": "Những nhạc sĩ, danh họa mang lại vẻ đẹp tâm hồn", "scores": {"a2222222-2222-2222-2222-222222222222": 3, "a7777777-7777-7777-7777-777777777777": 2}},
  {"text": "Những lãnh tụ dân tộc đấu tranh vì độc lập", "scores": {"a5555555-5555-5555-5555-555555555555": 3, "a8888888-8888-8888-8888-888888888888": 2}}
]'::jsonb),
('Khát vọng lớn nhất của bạn đóng góp cho cộng đồng là gì?', '[
  {"text": "Chia sẻ tri thức, giáo dục thế hệ tương lai", "scores": {"a6666666-6666-6666-6666-666666666666": 3}},
  {"text": "Bảo vệ nền hòa bình và xây dựng chính trị vững mạnh", "scores": {"a5555555-5555-5555-5555-555555555555": 3, "a8888888-8888-8888-8888-888888888888": 2}},
  {"text": "Sáng tác tác phẩm văn hóa nghệ thuật lay động lòng người", "scores": {"a7777777-7777-7777-7777-777777777777": 3, "a2222222-2222-2222-2222-222222222222": 2}},
  {"text": "Phát triển công nghệ giải quyết các vấn đề thiết thực", "scores": {"a1111111-1111-1111-1111-111111111111": 3, "a3333333-3333-3333-3333-333333333333": 2}}
]'::jsonb);

-- ============================================================
-- PHẦN 4 — EMAIL VÀ MSSV TRÊN CÁC HỒ SƠ NGƯỜI DÙNG (PROFILES)
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_id text;

-- Cập nhật dữ liệu cho các tài khoản cũ từ auth.users
UPDATE public.profiles p
SET email = u.email,
    student_id = u.raw_user_meta_data->>'student_id'
FROM auth.users u
WHERE p.id = u.id;

-- Cập nhật Trigger hàm để tự động điền email và student_id khi đăng ký tài khoản mới
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, email, student_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    new.raw_user_meta_data->>'student_id'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

