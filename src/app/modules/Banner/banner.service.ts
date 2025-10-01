import prisma from '../../utils/prisma';

const createBanner = async (image: string) => {
  const existingBanner = await prisma.banner.findFirst({ where: { image } });

  if (existingBanner) {
    throw new Error('Banner already exists!');
  }

  const banner = await prisma.banner.create({ data: { image } });
  return banner;
};

const getAllBanners = async () => {
  const banners = await prisma.banner.findMany();
  return banners;
};

const getBannerById = async (id: string) => {
  const banner = await prisma.banner.findUnique({ where: { id } });
  return banner;
};

const updateBanner = async (id: string, image: string) => {
  const banner = await prisma.banner.update({
    where: { id },
    data: { image },
  });
  return banner;
};

const deleteBanner = async (id: string) => {
  const banner = await prisma.banner.delete({ where: { id } });
  return banner;
};

export const BannerServices = {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};
