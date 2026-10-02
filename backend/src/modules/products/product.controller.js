import * as ProductService from './product.service.js';
import { sendSuccess, sendCreated } from '../../common/helpers/api-response.helper.js';

export const list = async (req, res) => {
  const result = await ProductService.listProducts(req.query);
  return sendSuccess(res, result.items, 'Products retrieved successfully', 200, result.pagination);
};

export const getBySlug = async (req, res) => {
  const product = await ProductService.getProductBySlug(req.params.slug);
  return sendSuccess(res, product, 'Product retrieved by slug');
};

export const getById = async (req, res) => {
  const product = await ProductService.getProductById(req.params.id);
  return sendSuccess(res, product, 'Product retrieved by ID');
};

export const create = async (req, res) => {
  const product = await ProductService.createProduct(req.body);
  return sendCreated(res, product, 'Product created successfully');
};

export const update = async (req, res) => {
  const product = await ProductService.updateProduct(req.params.id, req.body);
  return sendSuccess(res, product, 'Product updated successfully');
};

export const remove = async (req, res) => {
  const product = await ProductService.deleteProduct(req.params.id);
  return sendSuccess(res, product, 'Product deactivated successfully');
};
