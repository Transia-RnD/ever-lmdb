# Everlmdb - Secure Evernode Contract DB.

Learn how to get ever-lmdb-sdk set up in your project in under thirty minutes. {% .lead %}

---

## Quick start

Ever-lmdb-sdk is a powerful library that allows secure data storage and retrieval in Evernode smart contracts using LMDB. In this guide, we will walk you through the steps required to set up Ever-lmdb-sdk in your project.

### Installing dependencies

To install Ever-lmdb-sdk, you'll need to have Node.js and Yarn installed on your system. Once you have these dependencies installed, you can install Ever-lmdb-sdk in your Evernode contract and your Evernode client using the following command:

```shell
yarn add ever-lmdb-sdk
```

### Configuring the Contract

To configure your contract to work with Ever-lmdb-sdk, you'll need to import the ApiService from the library and create an instance of it inside your contract function.

```ts
const HotPocket = require("hotpocket-nodejs-contract");
const { ApiService } = require("ever-lmdb-sdk"); // import ApiService

const contract = async (ctx) => {
  const isReadOnly = ctx.readonly;
  const api = new ApiService(); // init the ApiService
  for (const user of ctx.users.list()) {
    for (const input of user.inputs) {
      const buf = await ctx.users.read(input);
      const request = JSON.parse(buf);
      await api.handleRequest(user, request, isReadOnly); // add the api handler
    }
  }
};
const hpc = new HotPocket.Contract();
hpc.init(contract);
```

---

### Configuring the Client

To interact with the Ever-lmdb-sdk from your JavaScript client application, you'll first need to import and initialize the necessary components from the library. Here's an example of how this might look:

```ts
const HotPocket = require("hotpocket-js-client");
const {
  Sdk,
  EverKeyPair,
  MessageModel,
  decodeModel,
  uint8ArrayToHex
} = require('ever-lmdb-sdk')
const { deriveAddress } = require('ripple-keypairs');

var client = new ClientApp();
  if (await client.init()) {
    
    const everKp = new EverKeyPair(
      uint8ArrayToHex(client.userKeyPair.publicKey), 
      uint8ArrayToHex(client.userKeyPair.privateKey).slice(0, 66)
    )
    const sdk = new Sdk(everKp, client)
    // ...
  }
}
```

### Your first model

Before you can store data using Ever-lmdb-sdk, you'll need to create a custom data model that represents the object you want to store.

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

### Storing Data

Once you have defined your custom data model, you can use the Ever-lmdb-sdk to store it in an Evernode smart contract. Here's an example of how this might look:

```ts
// Construct a reference to the collection and document you want 
// to store the data in
const collectionRef = sdk.collection('people');
const documentRef = collectionRef.document('123').convert(CustomModel);

// Create a new instance of your custom model
const person = new CustomModel('Alice Smith', 30);

// Use the `set` function to store the data
await documentRef.set(person);

// You can also retrieve the data by calling `get` on the reference
const response = await documentRef.get();
const decoded = decodeModel(response.snapshot.binary, CustomModel)
console.log(decoded.name); // Output: "Alice Smith"
```

### Retrieving Data

To retrieve data stored in an Evernode smart contract using Ever-lmdb-sdk, you can use the `get` function on the appropriate reference. Here's an example:

```ts
// Construct a reference to the collection and document that 
// contains the data
const collectionRef = sdk.collection('people');
const documentRef = collectionRef.document('123');

// Use the `get` function to retrieve the data
const response = await documentRef.get();

// Decode the binary data using your custom model
const person = decodeModel(response.snapshot.binary, CustomModel);

// Use the data as needed
console.log(person.name); // Output: "Alice Smith"
console.log(person.age); // Output: 30
```

---

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
