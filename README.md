---
title: Getting started
pageTitle: Everlmdb - Secure Evernode Contract DB.
description: Securly store and retrieve data in evernode smart contracts using lmdb
---

# Ever-Lmdb-Sdk

Learn how to get ever-lmdb-sdk set up in your project in under thirty minutes.

---

## Quick start

To get started using ever-lmdb-sdk you will need to install the dependency into your evernode contract and your evernode client.

### Installing dependencies

Sit commodi iste iure molestias qui amet voluptatem sed quaerat. Nostrum aut pariatur. Sint ipsa praesentium dolor error cumque velit tenetur quaerat exercitationem. Consequatur et cum atque mollitia qui quia necessitatibus.

```shell
yarn add ever-lmdb-sdk
```

Possimus saepe veritatis sint nobis et quam eos. Architecto consequatur odit perferendis fuga eveniet possimus rerum cumque. Ea deleniti voluptatum deserunt voluptatibus ut non iste. Provident nam asperiores vel laboriosam omnis ducimus enim nesciunt quaerat. Minus tempora cupiditate est quod.

{% callout type="warning" title="Oh no! Something bad happened!" %}
This is what a disclaimer message looks like. You might want to include inline `code` in it. Or maybe you’ll want to include a [link](/) in it. I don’t think we should get too carried away with other scenarios like lists or tables — that would be silly.
{% /callout %}

### Configuring the contract

Sit commodi iste iure molestias qui amet voluptatem sed quaerat. Nostrum aut pariatur. Sint ipsa praesentium dolor error cumque velit tenetur quaerat exercitationem. Consequatur et cum atque mollitia qui quia necessitatibus.

```js
// cache-advance.config.js
export default {
  strategy: 'predictive',
  engine: {
    cpus: 12,
    backups: ['./storage/cache.wtf'],
  },
}
```

Possimus saepe veritatis sint nobis et quam eos. Architecto consequatur odit perferendis fuga eveniet possimus rerum cumque. Ea deleniti voluptatum deserunt voluptatibus ut non iste. Provident nam asperiores vel laboriosam omnis ducimus enim nesciunt quaerat. Minus tempora cupiditate est quod.

{% callout title="You should know!" %}
This is what a disclaimer message looks like. You might want to include inline `code` in it. Or maybe you’ll want to include a [link](/) in it. I don’t think we should get too carried away with other scenarios like lists or tables — that would be silly.
{% /callout %}

---

### Configuring the client

Sit commodi iste iure molestias qui amet voluptatem sed quaerat. Nostrum aut pariatur. Sint ipsa praesentium dolor error cumque velit tenetur quaerat exercitationem. Consequatur et cum atque mollitia qui quia necessitatibus.

```js
// cache-advance.config.js
export default {
  strategy: 'predictive',
  engine: {
    cpus: 12,
    backups: ['./storage/cache.wtf'],
  },
}
```

Possimus saepe veritatis sint nobis et quam eos. Architecto consequatur odit perferendis fuga eveniet possimus rerum cumque. Ea deleniti voluptatum deserunt voluptatibus ut non iste. Provident nam asperiores vel laboriosam omnis ducimus enim nesciunt quaerat. Minus tempora cupiditate est quod.

{% callout title="You should know!" %}
This is what a disclaimer message looks like. You might want to include inline `code` in it. Or maybe you’ll want to include a [link](/) in it. I don’t think we should get too carried away with other scenarios like lists or tables — that would be silly.
{% /callout %}

---

## Basic usage

Praesentium laudantium magni. Consequatur reiciendis aliquid nihil iusto ut in et. Quisquam ut et aliquid occaecati. Culpa veniam aut et voluptates amet perspiciatis. Qui exercitationem in qui. Vel qui dignissimos sit quae distinctio.

### Your first model

First you need to create a custom model. Place this somewhere and then access it in your contract file. (You could also place this in the contract file.)

The `CustomModel` is an example of a custom model derived from the `BaseModel`. This model has two fields: `name` and `age`. Other custom models can define their own fields and metadata.

```ts
export class CustomModel extends BaseModel {
  name: VarString
  age: UInt64

  constructor(name: string, age: number) {
    super()
    this.name = name
    this.age = age
  }

  getMetadata(): Metadata {
    return [
      { field: 'name', type: 'varString', maxStringLength: 32 },
      { field: 'age', type: 'uint64' }
    ]
  }
}
```

The `getMetadata()` method returns an array of metadata elements, each of which defines a field in the model. Each metadata element specifies the name of the field and its type.

Binary models allow efficient serialization and deserialization of complex data structures in binary hex.

### Initialize the sdk

Then you need to initialize the sdk inside the hotpocket smart contract.

```ts
const sdk = new Sdk('one', hp_keypair, hp_client)
```

### Construct the path

Build the path using `collection` and `document` functions.

```ts
const ref = sdk.collection('Messages').document(address)
```

### Initialize the model and encode

Create a new Custom model. TODO: DA import json

```ts
const model = new CustomModel(
  'John Doe',
  BigInt(31),
)
const binary = model.encode()
```

### Call the sdk function

Finally make the sdk call to the evernode smart contract. In this case its saving a new document at the reference you chose above.

```ts
await ref.set(binary)
```

# Getting help

If you have any questions or issues related to this project, please don't hesitate to ask for help. There are several ways to get support:

## Submit an issue

If you have encountered a problem or have a question, the best way to get help is by submitting an issue to the project's GitHub repository. To do so, please follow these steps:

1. Navigate to the [Issues](https://github.com/Transia-RnD/ever-lmdb) section of the repository.
2. Click on the "New issue" button.
3. Fill out the issue template with relevant information, including a clear and concise description of the problem or question.
4. Click "Submit new issue".

A member of the project team will review your issue and provide assistance as soon as possible. Please be respectful and patient as we work to address your concerns.

## Get help from the community

If you would like to receive support from the larger community, you can post your question on a relevant forum or message board. Some popular options include:

- [Stack Overflow](https://stackoverflow.com)

When posting your question, please provide as much detail as possible, including any error messages or logs that may help others troubleshoot the issue.

## Contact the project maintainers

If you have a question or concern that you would like to address directly with the project maintainers, you can contact us via email at [support@transia.co](support@example.co). We will do our best to respond in a timely manner, but please understand that we may not be able to provide immediate assistance.

Thank you for using our project, and we hope that this information helps you get the support you need.
