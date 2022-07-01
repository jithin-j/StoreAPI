const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  // const search = "ab";
  const products = await Product.find({})
    .sort("name")
    .select("name price")
    .limit(5)
    .skip(5);
  res.status(200).json({ products, nbhits: products.length });
};

const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  // console.log(featured);
  queryObject = {};
  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }
  if (name) {
    queryObject.name = { $regex: name, $options: "i" }; //options i makes case-insensitive
  }
  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$e",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(<|>|>=|<=|=)\b/g;

    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    console.log(filters);
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }
  //console.log(queryObject);
  let result = Product.find(queryObject);
  //To sort in desc provide -name
  if (sort) {
    productList = sort.split(",").join(" ");
    // console.log(productList);
    result = result.sort(productList);
  } else {
    result = result.sort("createdAt");
  }
  if (fields) {
    fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  // console.log(queryObject);
  const products = await result;
  res.status(200).json({ products, nbhits: products.length });
};

module.exports = {
  getAllProducts,
  getAllProductsStatic,
};
