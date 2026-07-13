-- ConversionFlowModal(데이터 이전 신청 / 단말기 신청)을 위한 테이블·스토리지 설정
-- Supabase 대시보드 > SQL Editor 에서 그대로 실행하세요.

-- 1) 데이터 이전 신청 테이블
create table if not exists data_migration_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'requested', -- 'requested' | 'skipped' | 'completed'
  created_at timestamptz not null default now()
);

alter table data_migration_requests enable row level security;

-- supabaseAdmin은 service role이 아니라 일반 로그인 세션(관리자 계정)이라
-- 조회는 인증된 사용자 전체 허용(기존 profiles/conversion_clicks과 동일한 방식) -
-- 그래야 관리자 페이지에서 다른 사람이 신청한 행도 볼 수 있음
create policy "인증된 사용자 조회" on data_migration_requests
  for select using (auth.role() = 'authenticated');

create policy "본인 데이터 이전 신청 등록" on data_migration_requests
  for insert with check (auth.uid() = user_id);

-- 관리자 페이지의 "완료처리" 버튼은 status를 update 하므로 update 정책도 필요.
-- 소유자를 구분하지 않고 인증된 사용자면 update 가능하게 열어둠(관리자 계정도 그냥 authenticated 세션이라서).
create policy "인증된 사용자 수정" on data_migration_requests
  for update using (auth.role() = 'authenticated');

-- 2) 단말기 신청 테이블
create table if not exists device_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null, -- 'A' | 'B'
  has_existing_device boolean default false,
  biz_no text,
  academy_name text,
  contact_name text,
  phone text,
  address text,
  attachments jsonb default '{}'::jsonb, -- { bizCert: 'path', ... } (device-attachments 버킷 내 경로)
  created_at timestamptz not null default now()
);

alter table device_applications enable row level security;

create policy "인증된 사용자 조회" on device_applications
  for select using (auth.role() = 'authenticated');

create policy "본인 단말기 신청 등록" on device_applications
  for insert with check (auth.uid() = user_id);

-- 3) 첨부파일 스토리지 버킷
-- Supabase 대시보드 > Storage 에서 버킷을 직접 만드는 것을 권장합니다:
--   이름: device-attachments, Public bucket: 꺼짐(비공개)
-- 아래 SQL로도 생성 가능합니다.
insert into storage.buckets (id, name, public)
values ('device-attachments', 'device-attachments', false)
on conflict (id) do nothing;

-- 본인은 자신의 user_id 폴더(경로가 `${user.id}/...`로 시작)에만 업로드 가능
create policy "본인 첨부파일 업로드" on storage.objects
  for insert with check (
    bucket_id = 'device-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 관리자 페이지(첨부파일 확인 버튼)가 signed URL을 발급하려면 본인 소유가 아닌 파일도
-- 조회할 수 있어야 하므로, 인증된 사용자면 전체 조회 허용(버킷 자체는 비공개라
-- 무작위로 URL을 알아내지 않는 한 접근 불가)
create policy "인증된 사용자 첨부파일 조회" on storage.objects
  for select using (
    bucket_id = 'device-attachments'
    and auth.role() = 'authenticated'
  );

-- 4) [추가] 관리자 메모(학원명/성명/연락처 수기 입력) 컬럼
-- 이미 위 테이블들을 생성하셨다면 이 부분만 추가로 실행하면 됩니다.
alter table data_migration_requests add column if not exists memo jsonb default '{}'::jsonb;

-- 5) [추가] 휴지통(소프트 삭제) 컬럼 - null이면 정상 목록, 값이 있으면 휴지통으로 표시
alter table data_migration_requests add column if not exists deleted_at timestamptz;

-- 관리자 페이지의 삭제(휴지통 이동)/완전 삭제 기능은 update/delete 권한이 필요.
-- update 정책은 이미 위에서(3번째 정책) 인증된 사용자 전체에 열려있어 재사용 가능.
-- delete는 별도 정책이 없으므로 아래에서 추가.
create policy "인증된 사용자 삭제" on data_migration_requests
  for delete using (auth.role() = 'authenticated');

-- 6) [추가] 단말기 신청도 동일하게 휴지통(소프트 삭제) 지원
alter table device_applications add column if not exists deleted_at timestamptz;

-- device_applications는 지금까지 select/insert 정책만 있었으므로 휴지통 이동(update)/완전삭제(delete) 정책 추가
create policy "인증된 사용자 수정" on device_applications
  for update using (auth.role() = 'authenticated');

create policy "인증된 사용자 삭제" on device_applications
  for delete using (auth.role() = 'authenticated');
