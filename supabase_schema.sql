-- SUPABASE DATABASE SCHEMA & SEED DATA
-- Copy and paste this script into the Supabase SQL Editor to initialize your database.

-- 1. Create stars table (Categories/Fields)
CREATE TABLE IF NOT EXISTS stars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  position_x float NOT NULL,
  position_y float NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- 2. Create planets table (Celebrities)
CREATE TABLE IF NOT EXISTS planets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  star_id uuid REFERENCES stars(id) ON DELETE CASCADE,
  name text NOT NULL,
  bio text,
  avatar_url text,
  orbit_radius float NOT NULL,
  orbit_speed float DEFAULT 1,
  planet_seed integer NOT NULL UNIQUE,
  planet_size float DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- 3. Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planet_id uuid REFERENCES planets(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  year integer,
  category text
);

-- 4. Enable Row Level Security (RLS) - Optional but recommended for public reading
ALTER TABLE stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE planets ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 5. Create Select Policies (Enable public read access)
CREATE POLICY "Allow public read access to stars" ON stars FOR SELECT USING (true);
CREATE POLICY "Allow public read access to planets" ON planets FOR SELECT USING (true);
CREATE POLICY "Allow public read access to achievements" ON achievements FOR SELECT USING (true);

-- =========================================================================
-- SEED DATA (Aligns perfectly with src/lib/mockData.ts for continuous mapping)
-- =========================================================================

-- Seed stars
INSERT INTO stars (id, name, color, position_x, position_y, icon) VALUES
('a7777777-7777-7777-7777-777777777777', 'Văn Hóa', '#ec4899', -0.914, -0.06, '🎭'),
('a2222222-2222-2222-2222-222222222222', 'Nghệ thuật', '#a855f7', -0.468, 0.264, '🎨'),
('a3333333-3333-3333-3333-333333333333', 'Khoa học', '#22c55e', -0.430, 0.340, '🔬'),
('a5555555-5555-5555-5555-555555555555', 'Chính trị', '#6366f1', -0.164, 0.124, '👑'),
('a4444444-4444-4444-4444-444444444444', 'Triết học', '#eab308', 0.216, 0.016, '📜'),
('a8888888-8888-8888-8888-888888888888', 'Quân sự', '#ef4444', 0.356, -0.456, '⚔️'),
('a6666666-6666-6666-6666-666666666666', 'Giáo dục', '#f97316', 0.894, -0.24, '🎓'),
('a1111111-1111-1111-1111-111111111111', 'Công nghệ', '#3b82f6', 0.89, 0.38, '💻')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  color = EXCLUDED.color,
  position_x = EXCLUDED.position_x,
  position_y = EXCLUDED.position_y,
  icon = EXCLUDED.icon;

-- Seed planets
INSERT INTO planets (id, star_id, name, bio, avatar_url, orbit_radius, orbit_speed, planet_seed, planet_size) VALUES
-- Alkaid (Văn Hóa)
('nguyen-trai', 'a7777777-7777-7777-7777-777777777777', 'Nguyễn Trãi', 'Nguyễn Trãi (hiệu Ức Trai) là một nhà chính trị, nhà quân sự kiệt xuất và danh nhân văn hóa thế giới thời Lê sơ. Ông là người đã phò tá Lê Lợi lật đổ ách đô hộ của nhà Minh, soạn thảo áng văn thiên cổ bất hủ "Bình Ngô Đại Cáo" khẳng định nền độc lập trường tồn của dân tộc Việt Nam.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 2.3, 1.0, 45781, 0.54),
('nguyen-du', 'a7777777-7777-7777-7777-777777777777', 'Nguyễn Du', 'Nguyễn Du (tự Tố Như, hiệu Thanh Hiên) là nhà thơ lớn của Việt Nam thời Tây Sơn và đầu triều Nguyễn. Với vốn hiểu biết sâu rộng, trái tim nhân đạo mênh mông, ông đã viết nên kiệt tác "Truyện Kiều" (Đoạn trường tân thanh) khắc họa sắc số phận đau khổ của con người, đặc biệt là người phụ nữ trong xã hội phong kiến phong trần.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 4.0, 0.7, 98124, 0.48),
-- Mizar (Nghệ thuật)
('trinh-cong-son', 'a2222222-2222-2222-2222-222222222222', 'Trịnh Công Sơn', 'Trịnh Công Sơn được coi là một trong những nhạc sĩ lớn nhất của Tân nhạc Việt Nam. Nhạc của ông đậm chất triết lý nhân sinh, thấm đượm tình yêu, thân phận và ước vọng hòa bình. Những sáng tác bất hủ như "Diễm xưa", "Cát bụi", "Huyền thoại mẹ" chứa đựng dòng âm điệu mê hoặc lòng người qua nhiều thế hệ.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 2.5, 0.9, 11223, 0.52),
('to-ngoc-van', 'a2222222-2222-2222-2222-222222222222', 'Tô Ngọc Vân', 'Tô Ngọc Vân là một họa sĩ xuất sắc, thuộc thế hệ đầu tiên của Trường Cao đẳng Mỹ thuật Đông Dương. Ông đã đóng góp to lớn vào việc đưa chất liệu sơn dầu phương Tây hòa quyện đậm đà với linh hồn dân tộc Việt Nam. Ông hy sinh anh dũng trong chiến dịch Điện Biên Phủ lịch sử.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 4.2, 0.6, 55443, 0.46),
-- Alcor (Khoa học)
('luong-the-vinh', 'a3333333-3333-3333-3333-333333333333', 'Lương Thế Vinh', 'Lương Thế Vinh là trạng nguyên dưới thời vua Lê Thánh Tông. Ông là một nhà toán học lỗi lạc, tác giả cuốn sách "Đại thành toán pháp" - một cuốn sách toán giáo lý hoàn chỉnh đầu tiên của nước ta. Ông được mệnh danh là Thần Toán hay "Trạng Lường" nhờ vào tài đo đạc và tư duy toán học thông thái.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 2.0, 1.1, 88776, 0.48),
('ton-that-tung', 'a3333333-3333-3333-3333-333333333333', 'Tôn Thất Tùng', 'Tôn Thất Tùng là bác sĩ y học vĩ đại người Việt Nam, nổi danh khắp năm châu nhờ phương pháp mổ gan "khô" vô cùng nhanh chóng và hiệu quả, giảm tỷ lệ tử vong và biến chứng tối đa cho bệnh nhân. Ông đã viết cuốn sách kinh điển về cấu trúc gan và để lại một trường phái y khoa rực rỡ.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 3.8, 0.8, 66554, 0.52),
-- Alioth (Chính trị)
('ho-chi-minh', 'a5555555-5555-5555-5555-555555555555', 'Hồ Chí Minh', 'Hồ Chí Minh là vị lãnh tụ vĩ đại của cách mạng Việt Nam, người sáng lập Đảng Cộng sản Việt Nam và khai sinh ra nước Việt Nam Dân chủ Cộng hòa độc lập. Ông dâng trọn đời mình cho độc lập tự do của dân tộc thông qua các chiến dịch ngoại giao tài ba và tài thao lược xuất sắc trên thế giới.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 2.6, 1.25, 77112, 0.56),
('tran-hung-dao', 'a5555555-5555-5555-5555-555555555555', 'Trần Hưng Đạo', 'Trần Quốc Tuấn (tước hiệu Trần Hưng Đạo) không chỉ là nhà quân sự mà còn là một chính trị gia khôn khéo tầm quốc tế. Ông khuyên răn các vua Trần gắn bó mật thiết với nhân dân bảo vệ bờ cõi bằng tinh thần "khoan thư sức dân làm kế sâu rễ bền gốc" lừng lẫy thiên cổ.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 4.5, 0.75, 99001, 0.54),
-- Megrez (Triết học)
('chu-van-an', 'a4444444-4444-4444-4444-444444444444', 'Chu Văn An', 'Chu Văn An là nhà triết giáo, nhà sư phạm lỗi lạc chính trực và mẫu mực của Đại Việt thời Trần. Ông là người biên soạn giáo án "Tứ thư thuyết ước" truyền thụ tư tưởng nhân nghĩa, tự lập chính tâm. Ông từng dâng sớ chém 7 nịnh thần triều đình để cứu nước, giữ vững khí tiết thanh nhã suốt đời.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 2.4, 1.0, 77665, 0.48),
('nguyen-binh-khiem', 'a4444444-4444-4444-4444-444444444444', 'Nguyễn Bỉnh Khiêm', 'Nguyễn Bỉnh Khiêm là triết học gia lỗi lạc có tầm nhìn chiến lược đi trước hàng trăm năm lịch sử trung đại Việt Nam. Với kiến thức Dịch học uyên thâm, ông am tường thế giới tự nhiên và xã hội, viết hàng ngàn tác phẩm chữ Hán, chữ Nôm răn dạy con người sống hiền lương, tự tại, nhân nghĩa.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 4.0, 0.7, 88221, 0.52),
-- Phecda (Quân sự)
('vo-nguyen-giap', 'a8888888-8888-8888-8888-888888888888', 'Võ Nguyên Giáp', 'Võ Nguyên Giáp là Đại tướng đầu tiên, Tổng tư lệnh Quân đội Nhân dân Việt Nam anh hùng. Được ghi danh là một trong những thống soái vĩ đại nhất của văn minh loài người, ông đã đánh bại hai đế quốc thực dân Pháp cường bạo và xâm lược Mỹ bằng nghệ thuật chiến tranh nhân dân sáng tạo, xoay chuyển cục diện lịch sử.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 2.5, 1.15, 44889, 0.58),
('ly-thuong-kiet', 'a8888888-8888-8888-8888-888888888888', 'Lý Thường Kiệt', 'Lý Thường Kiệt là một danh tướng kiệt xuất đời nhà Lý Việt Nam. Ông lập công hiển hách đánh Tống, bình Chiêm giữ vững phên giậu nước nhà. Ông là người chủ trương tiên phát chế nhân làm đảo lộn hoàn toàn mưu đồ xâm lấn của quân địch, kiến tạo phòng tuyến sông Như Nguyệt huyền thoại.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 4.4, 0.65, 12299, 0.5),
-- Merak (Giáo dục)
('le-quy-don', 'a6666666-6666-6666-6666-666666666666', 'Lê Quý Đôn', 'Lê Quý Đôn (tự Doãn Hậu, hiệu Cát Sỹ) là nhà bác học lớn nhất thời trung đại Việt Nam. Với tư duy bác học bách khoa uyên thâm bậc nhất, ông biên soạn giáo trình giảng dạy khổng lồ cho nho sĩ sĩ tử, tổng hợp trọn đời tri thức về triết học, địa lý, sử học, văn học, thiên văn.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 2.7, 0.95, 55667, 0.5),
('nguyen-dinh-chieu', 'a6666666-6666-6666-6666-666666666666', 'Nguyễn Đình Chiểu', 'Nguyễn Đình Chiểu (thường gọi cụ Đồ Chiểu) là một danh nhân xuất thân nhà giáo mẫu mực ái quốc lỗi lạc ở phương Nam. Bị mù cả hai mắt từ trẻ, cụ Đồ Chiểu vượt lên bi kịch gia đạo mở trường dạy học, bốc thuốc cứu người bách tính và sáng tác những vần thơ bất hủ kích lệ tinh thần đánh giặc.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 4.6, 0.6, 33221, 0.46),
-- Dubhe (Công nghệ)
('tran-dai-nghia', 'a1111111-1111-1111-1111-111111111111', 'Trần Đại Nghĩa', 'Phạm Quang Lễ (tên hiệu Trần Đại Nghĩa) là giáo sư, viện sĩ khoa học sáng chế vĩ đại thời đại Hồ Chí Minh. Tiếp thu kiến thức chế tạo máy bay và vũ khí hiện đại bậc cao tại Pháp, ông theo Bác Hồ về nước lập công biên soạn tài liệu và trực tiếp thiết kế, chế tạo nên khí tài đặc chủng Bazooka, SKZ hủy diệt xe tăng lô cốt thực dân.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 2.4, 1.05, 77119, 0.53),
('nguyen-an', 'a1111111-1111-1111-1111-111111111111', 'Nguyễn An', 'Nguyễn An là tổng công trình sư, kiến trúc sư đại tài người Việt gốc Hà Đông dưới triều Minh phong kiến. Bị bắt sang Trung Quốc làm nội quan sau thất bại của nhà Hồ, nhờ tài cao phi phàm về tính toán cấu trúc xây dựng và vẽ đồ bản trị thủy sông ngòi, ông được giao đại nhiệm thiết kế và làm tổng đốc xây dựng Tử Cấm Thành uy nghi trấn giữ Bắc Kinh.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 4.5, 0.7, 99112, 0.48)
ON CONFLICT (id) DO UPDATE SET
  star_id = EXCLUDED.star_id,
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  orbit_radius = EXCLUDED.orbit_radius,
  orbit_speed = EXCLUDED.orbit_speed,
  planet_seed = EXCLUDED.planet_seed,
  planet_size = EXCLUDED.planet_size;

-- Seed achievements
INSERT INTO achievements (id, planet_id, title, description, year, category) VALUES
-- Nguyễn Trãi
('c7777777-1111-1111-1111-111111111111', 'nguyen-trai', 'Soạn thảo Bình Ngô Đại Cáo', 'Chủ trì soạn thảo Đại bản tuyên ngôn độc lập thứ hai của dân tộc Việt Nam sau chiến thắng giặc Minh.', 1428, 'Văn chương'),
('c7777777-1111-1111-1111-222222222222', 'nguyen-trai', 'Danh nhân Văn hóa Thế giới', 'Được Tổ chức Giáo dục, Khoa học và Văn hóa Liên Hợp Quốc (UNESCO) vinh danh chính thức nhân kỷ niệm 600 năm ngày sinh.', 1980, 'UNESCO'),
('c7777777-1111-1111-1111-333333333333', 'nguyen-trai', 'Quốc âm thi tập', 'Tác giả của tập thơ Nôm cổ nhất và phong phú nhất còn lưu lại đến ngày nay, đặt nền móng văn học dân tộc.', 1430, 'Thơ Nôm'),
-- Nguyễn Du
('c7777777-2222-1111-1111-111111111111', 'nguyen-du', 'Sáng tác kiệt tác Truyện Kiều', 'Bản trường ca thơ lục bát kiệt xuất Đoạn trường tân thanh, đỉnh cao văn học trung đại, dịch ra hơn 20 ngôn ngữ.', 1810, 'Văn học'),
('c7777777-2222-1111-1111-222222222222', 'nguyen-du', 'Vinh danh Văn hóa Thế giới', 'Được Hội đồng Hòa bình Thế giới quyết định kỷ niệm sinh nhật như một Danh nhân Văn hóa Thế giới.', 1965, 'Danh nhân'),
-- Trịnh Công Sơn
('c2222222-1111-1111-1111-111111111111', 'trinh-cong-son', 'Nhận giải thưởng đĩa vàng (Golden Disc)', 'Nhận giải thưởng đĩa vàng tại Nhật Bản cho ca khúc "Diễm xưa" với số lượng phát hành khổng lồ.', 1972, 'Âm nhạc'),
('c2222222-1111-1111-1111-222222222222', 'trinh-cong-son', 'Giải Âm nhạc Hòa bình Quốc tế', 'Được trao tặng giải thưởng Âm nhạc hòa bình quốc tế cao quý cho những thông điệp nhân văn trong tác phẩm.', 2004, 'Hòa bình'),
-- Tô Ngọc Vân
('c2222222-2222-1111-1111-111111111111', 'to-ngoc-van', 'Vẽ kiệt tác Thiếu nữ bên hoa huệ', 'Sáng tác bức họa sơn dầu kinh điển mang tính biểu tượng cao của nền mỹ thuật Việt Nam hiện đại.', 1943, 'Mỹ thuật'),
-- Lương Thế Vinh
('c3333333-1111-1111-1111-111111111111', 'luong-the-vinh', 'Đại thành toán pháp', 'Biên soạn bộ sách toán học giáo khoa đầu tiên của bờ cõi Việt Nam, ứng dụng đo đạc vĩ đại.', 1470, 'Toán học'),
-- Tôn Thất Tùng
('c3333333-2222-1111-1111-111111111111', 'ton-that-tung', 'Phát minh phương pháp cắt gan khô', 'Phát minh ra phương pháp mổ cắt gan cực nhanh trong vòng vài phút mang tên "Phương pháp Tôn Thất Tùng" nổi tiếng toàn cầu.', 1939, 'Y học'),
-- Hồ Chí Minh
('c5555555-1111-1111-1111-111111111111', 'ho-chi-minh', 'Đọc Tuyên ngôn Độc lập', 'Đọc bản Tuyên ngôn Độc lập tại quảng trường Ba Đình lịch sử khai sinh ra nước Việt Nam Dân chủ Cộng hòa.', 1945, 'Chính trị'),
('c5555555-1111-1111-1111-222222222222', 'ho-chi-minh', 'Danh nhân Văn hóa - Anh hùng dân tộc', 'Được UNESCO công nhận là Anh hùng giải phóng dân tộc Việt Nam và Nhà văn hóa kiệt xuất.', 1990, 'UNESCO'),
-- Trần Hưng Đạo
('c5555555-2222-1111-1111-111111111111', 'tran-hung-dao', 'Chiến thắng sông Bạch Đằng', 'Đại thắng quân Mông Nguyên lần thứ 3 trên sông Bạch Đằng bằng chiến thuật cọc gỗ độc đáo.', 1288, 'Quân sự'),
-- Chu Văn An
('c4444444-1111-1111-1111-111111111111', 'chu-van-an', 'Dâng sớ Thất trảm sớ', 'Khảng khái dâng sớ xin chém đầu 7 nịnh thần triều đình tham nhũng hại dân hại nước dưới triều Trần.', 1360, 'Tư tưởng'),
-- Võ Nguyên Giáp
('c8888888-1111-1111-1111-111111111111', 'vo-nguyen-giap', 'Đại thắng Điện Biên Phủ', 'Chỉ huy chiến dịch đánh sập tập đoàn cứ điểm Điện Biên Phủ của quân viễn chinh Pháp lừng lẫy địa cầu.', 1954, 'Quân sự'),
-- Lý Thường Kiệt
('c8888888-2222-1111-1111-111111111111', 'ly-thuong-kiet', 'Nam quốc sơn hà', 'Tác giả bài thơ thần vang dội tại phòng tuyến sông Như Nguyệt, được coi là bản Tuyên ngôn Độc lập đầu tiên.', 1077, 'Quân sự'),
-- Lê Quý Đôn
('c6666666-1111-1111-1111-111111111111', 'le-quy-don', 'Biên soạn Vân đài loại ngữ', 'Tác phẩm bách khoa toàn thư tri thức khoa học giáo dục đầu tiên của Việt Nam.', 1773, 'Bác học'),
-- Trần Đại Nghĩa
('c1111111-1111-1111-1111-111111111111', 'tran-dai-nghia', 'Chế tạo vũ khí Bazooka quân sự', 'Nghiên cứu cải tiến và trực tiếp chế tạo súng Bazooka và súng không giật SKZ phá hủy xe tăng lô cốt giặc Pháp cứu nước.', 1947, 'Chế tạo')
ON CONFLICT (id) DO UPDATE SET
  planet_id = EXCLUDED.planet_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  year = EXCLUDED.year,
  category = EXCLUDED.category;
